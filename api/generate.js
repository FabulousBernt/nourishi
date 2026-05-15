// Simple in-memory rate limiter (per Vercel instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per IP per minute
const RATE_LIMIT_MAX_ENTRIES = 10000; // prevent unbounded map growth
const MAX_PROMPT_LENGTH = 5000;
const MAX_BODY_SIZE = 20000; // max request body size in bytes

// Content blocklist — server-side mirror of src/utils/contentFilter.js
const BLOCKED_PATTERNS = [
  "murder", "\\bkill\\b", "suicide", "torture", "\\bassault\\b", "\\bstab\\b", "\\bshoot",
  "strangle", "dismember", "decapitat", "mutilat", "massacre", "genocide",
  "\\bbomb\\b", "terrorist", "terroris",
  "porn", "hentai", "\\bxxx\\b", "orgasm", "\\borgy\\b", "fetish", "bdsm",
  "genitals", "penis", "vagina", "\\banus\\b", "\\bnude\\b", "\\bnaked\\b",
  "masturbat", "ejaculat", "erotic",
  "cocaine", "\\bheroin\\b", "methamphetamine", "meth lab", "fentanyl", "crack pipe",
  "drug deal", "overdose",
  "nigger", "nigga", "faggot", "\\bkike\\b", "\\bspic\\b", "\\bchink\\b", "wetback",
  "white power", "white supremac", "\\bnazi", "heil hitler",
  "how to make a weapon", "how to poison", "child abuse", "pedophil", "\\brape\\b",
];
const blockedRegex = new RegExp(
  BLOCKED_PATTERNS.join("|"),
  "i"
);
function isBlockedContent(str) {
  return typeof str === "string" && blockedRegex.test(str);
}

// Models to try in order on Cerebras (free tier: 30 RPM, 1M tokens/day)
const MODEL_CHAIN = [
  "llama3.1-8b",
  "qwen-3-235b-a22b-instruct-2507",
];

// Only allow requests from our own origin(s)
const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

// Sanitize user-provided text: strip control chars and limit length
function sanitizeInput(str, maxLen = 500) {
  if (typeof str !== "string") return "";
  // Remove control characters (except newline/tab), null bytes, and non-printable chars
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen).trim();
}

function checkRateLimit(ip) {
  const now = Date.now();
  // Evict expired entries if map is getting large
  if (rateLimit.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, entry] of rateLimit) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW) rateLimit.delete(key);
    }
  }
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Use AI to estimate nutrition for TheMealDB recipes based on their ingredients
async function estimateNutritionWithAI(apiKey, recipes) {
  if (recipes.length === 0) return recipes;

  const recipeList = recipes.map((r, i) => `${i + 1}. ${r.name}: ${r.ingredients.join(", ")}`).join("\n");

  const prompt = `Estimate the nutrition per serving (assuming 4 servings) for each recipe based on its ingredients. Return ONLY a JSON array with objects containing: {"calories": number, "protein": number, "carbs": number, "fat": number} in the same order. Be realistic — a pasta carbonara is ~500-600 cal, a salad ~200-300 cal. Only return the JSON array, nothing else.

Recipes:
${recipeList}`;

  const result = await callLLM(apiKey, MODEL_CHAIN[0], "You are a nutrition calculator. Return only valid JSON.", prompt);

  if (!result.ok) return recipes;

  try {
    const text = result.text.replace(/```json?\n?/g, "").replace(/```/g, "");
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return recipes;

    const nutritionData = JSON.parse(jsonMatch[0]);

    return recipes.map((recipe, i) => {
      const n = nutritionData[i];
      if (!n) return recipe;
      return {
        ...recipe,
        calories: n.calories || null,
        protein: n.protein || null,
        carbs: n.carbs || null,
        fat: n.fat || null,
        isApprox: true,
      };
    });
  } catch (e) {
    console.error("Nutrition AI parse error:", e.message);
    return recipes;
  }
}

// Transform a TheMealDB meal object into our recipe schema
function transformMealDBRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (ing) {
      ingredients.push(measure ? `${measure} ${ing}` : ing);
    }
  }

  const instructions = (meal.strInstructions || "")
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const description = (meal.strInstructions || "").split(/[.!?]/)[0]?.trim() + "." || "";

  return {
    name: meal.strMeal,
    description: description.length > 120 ? description.slice(0, 117) + "..." : description,
    cuisine: meal.strArea || null,
    time: null,
    servings: "4",
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    isApprox: false,
    difficulty: null,
    ingredients,
    instructions,
    source: "TheMealDB",
    sourceUrl: meal.strSource || null,
    thumbnail: meal.strMealThumb || null,
  };
}

// Search TheMealDB by name
async function searchMealDB(query) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.meals) return [];
    return data.meals.slice(0, 4).map(transformMealDBRecipe);
  } catch (e) {
    console.error("TheMealDB search error:", e.message);
    return [];
  }
}

// Search TheMealDB by ingredient (returns less detail, needs lookup)
async function searchMealDBByIngredient(ingredient) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.meals) return [];
    // Get full details for top 3 results
    const detailed = await Promise.all(
      data.meals.slice(0, 3).map(async (m) => {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
        const d = await r.json();
        return d.meals?.[0] ? transformMealDBRecipe(d.meals[0]) : null;
      })
    );
    return detailed.filter(Boolean);
  } catch (e) {
    console.error("TheMealDB ingredient search error:", e.message);
    return [];
  }
}

async function callLLM(apiKey, model, systemPrompt, userPrompt) {
  const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text().catch(() => "");
    console.error(`${model} error ${status}:`, errText.slice(0, 200));
    return { ok: false, status, retryable: status === 429 || status === 503 };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  if (!text.trim()) {
    console.error(`${model}: empty response`);
    return { ok: false, status: 0, retryable: false };
  }

  return { ok: true, text };
}

export default async function handler(req, res) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Type", "application/json");

  // CORS handling — deny by default if ALLOWED_ORIGIN is not configured
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length > 0 && origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } else if (ALLOWED_ORIGINS.length > 0) {
    // No origin header but origins are configured — allow (same-origin requests)
  } else if (origin) {
    // ALLOWED_ORIGIN not set — reject cross-origin requests
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Request body size check
  const bodyStr = JSON.stringify(req.body || {});
  if (bodyStr.length > MAX_BODY_SIZE) {
    return res.status(413).json({ error: "Request too large" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const { systemPrompt, userPrompt, searchQuery, searchIngredient } = req.body || {};

  // Type validation
  if (typeof systemPrompt !== "string" || typeof userPrompt !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Length validation
  if (!systemPrompt.trim() || !userPrompt.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (systemPrompt.length > MAX_PROMPT_LENGTH || userPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Request too large" });
  }

  // Server-side sanitization of user-facing search fields
  const cleanSearchQuery = searchQuery ? sanitizeInput(searchQuery, 200) : undefined;
  const cleanSearchIngredient = searchIngredient ? sanitizeInput(searchIngredient, 50) : undefined;

  // Content moderation — block inappropriate terms
  if (isBlockedContent(userPrompt) || isBlockedContent(cleanSearchQuery) || isBlockedContent(cleanSearchIngredient)) {
    return res.status(400).json({ error: "Please search for food-related terms." });
  }

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Service temporarily unavailable" });
  }

  // Run TheMealDB search in parallel with AI generation
  const mealDBPromise = cleanSearchQuery
    ? searchMealDB(cleanSearchQuery)
    : cleanSearchIngredient
      ? searchMealDBByIngredient(cleanSearchIngredient)
      : Promise.resolve([]);

  // Try each model in the chain, falling back on rate limit or error
  let aiResult = null;
  for (const model of MODEL_CHAIN) {
    const result = await callLLM(apiKey, model, systemPrompt, userPrompt);
    if (result.ok) {
      aiResult = result;
      break;
    }
    if (!result.retryable) break;
    console.log(`${model} rate limited (${result.status}), trying next model...`);
  }

  // Wait for TheMealDB results, then estimate nutrition with AI in parallel
  const mealDBResults = await mealDBPromise;
  const nutritionPromise = mealDBResults.length > 0
    ? estimateNutritionWithAI(apiKey, mealDBResults)
    : Promise.resolve([]);

  // Parse AI results and mark with source
  let aiRecipes = [];
  if (aiResult?.text) {
    const text = aiResult.text.replace(/```json?\n?/g, "").replace(/```/g, "");
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        aiRecipes = JSON.parse(jsonMatch[0]).map(r => ({ ...r, source: "AI Generated" }));
      } catch (e) {
        console.error("AI JSON parse error:", e.message);
      }
    }
  }

  // Wait for nutrition estimates
  const enrichedMealDB = await nutritionPromise;

  // Merge results: interleave TheMealDB and AI recipes
  const combined = [];
  const maxLen = Math.max(enrichedMealDB.length, aiRecipes.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < enrichedMealDB.length) combined.push(enrichedMealDB[i]);
    if (i < aiRecipes.length) combined.push(aiRecipes[i]);
  }

  if (combined.length === 0) {
    return res.status(502).json({ error: "No recipes found. Please try a different search." });
  }

  return res.status(200).json({ recipes: combined });
}

export { sanitizeInput, checkRateLimit, isBlockedContent, transformMealDBRecipe };
