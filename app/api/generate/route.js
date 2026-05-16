import {
  sanitizeInput,
  checkRateLimit,
  isBlockedContent,
  transformMealDBRecipe,
} from "../../../src/lib/api-helpers.js";
import { getDb } from "../../../src/lib/db.js";

export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 5000;
const MAX_BODY_SIZE = 20000;

// Models to try in order on Cerebras (free tier: 30 RPM, 1M tokens/day)
const MODEL_CHAIN = [
  "llama3.1-8b",
  "qwen-3-235b-a22b-instruct-2507",
];

// Only allow requests from our own origin(s)
const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Type": "application/json",
};

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { ...SECURITY_HEADERS, ...extraHeaders },
  });
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

// Search saved recipes in the database
async function searchDatabase(query, ingredient) {
  try {
    const sql = getDb();
    let rows;
    if (query) {
      const pattern = `%${query}%`;
      rows = await sql`
        SELECT * FROM recipes
        WHERE name ILIKE ${pattern} OR cuisine ILIKE ${pattern} OR description ILIKE ${pattern}
        ORDER BY rating_count DESC, created_at DESC
        LIMIT 6
      `;
    } else if (ingredient) {
      const pattern = `%${ingredient}%`;
      rows = await sql`
        SELECT * FROM recipes
        WHERE ingredients::text ILIKE ${pattern}
        ORDER BY rating_count DESC, created_at DESC
        LIMIT 6
      `;
    } else {
      return [];
    }
    return rows.map(r => ({
      name: r.name,
      description: r.description,
      cuisine: r.cuisine,
      source: "Saved",
      time: r.time,
      servings: r.servings,
      difficulty: r.difficulty,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      isApprox: r.is_approx,
      ingredients: typeof r.ingredients === "string" ? JSON.parse(r.ingredients) : r.ingredients,
      instructions: typeof r.instructions === "string" ? JSON.parse(r.instructions) : r.instructions,
      thumbnail: r.thumbnail,
      sourceUrl: r.source_url,
      mealDBId: r.mealdb_id,
      ratingAvg: r.rating_count > 0 ? r.rating_sum / r.rating_count : 0,
      ratingCount: r.rating_count,
    }));
  } catch (e) {
    console.error("Database search error:", e.message);
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

export async function POST(request) {
  // CORS handling — deny by default if ALLOWED_ORIGIN is not configured
  const origin = request.headers.get("origin");
  const corsHeaders = {};

  // In Next.js, the API route is same-origin — the browser may still send an origin header.
  // Allow same-origin requests by comparing origin to the request URL's origin.
  const requestOrigin = new URL(request.url).origin;
  const isSameOrigin = origin === requestOrigin;

  if (ALLOWED_ORIGINS.length > 0 && origin && !isSameOrigin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
    } else {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
  } else if (!ALLOWED_ORIGINS.length && origin && !isSameOrigin) {
    // ALLOWED_ORIGIN not set — reject cross-origin requests
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  // Request body size check
  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_SIZE) {
    return jsonResponse({ error: "Request too large" }, 413, corsHeaders);
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders);
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: "Too many requests. Please wait a moment and try again." }, 429, corsHeaders);
  }

  const { systemPrompt, userPrompt, searchQuery, searchIngredient, includeAI = true, includeDB = true } = body || {};

  // Type validation — systemPrompt and userPrompt required only when AI is enabled
  if (includeAI && (typeof systemPrompt !== "string" || typeof userPrompt !== "string")) {
    return jsonResponse({ error: "Invalid request" }, 400, corsHeaders);
  }

  // Length validation (only when AI is enabled)
  if (includeAI) {
    if (!systemPrompt.trim() || !userPrompt.trim()) {
      return jsonResponse({ error: "Missing required fields" }, 400, corsHeaders);
    }
    if (systemPrompt.length > MAX_PROMPT_LENGTH || userPrompt.length > MAX_PROMPT_LENGTH) {
      return jsonResponse({ error: "Request too large" }, 400, corsHeaders);
    }
  }

  // Server-side sanitization of user-facing search fields
  const cleanSearchQuery = searchQuery ? sanitizeInput(searchQuery, 200) : undefined;
  const cleanSearchIngredient = searchIngredient ? sanitizeInput(searchIngredient, 50) : undefined;

  // Content moderation — block inappropriate terms
  if (isBlockedContent(userPrompt) || isBlockedContent(cleanSearchQuery) || isBlockedContent(cleanSearchIngredient)) {
    return jsonResponse({ error: "Please search for food-related terms." }, 400, corsHeaders);
  }

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (includeAI && !apiKey) {
    return jsonResponse({ error: "Service temporarily unavailable" }, 500, corsHeaders);
  }

  // Run DB search, TheMealDB search, and AI generation in parallel
  const dbPromise = includeDB
    ? searchDatabase(cleanSearchQuery, cleanSearchIngredient)
    : Promise.resolve([]);

  const mealDBPromise = includeDB
    ? (cleanSearchQuery
        ? searchMealDB(cleanSearchQuery)
        : cleanSearchIngredient
          ? searchMealDBByIngredient(cleanSearchIngredient)
          : Promise.resolve([]))
    : Promise.resolve([]);

  // Only run AI if enabled
  let aiResult = null;
  if (includeAI && apiKey) {
    for (const model of MODEL_CHAIN) {
      const result = await callLLM(apiKey, model, systemPrompt, userPrompt);
      if (result.ok) {
        aiResult = result;
        break;
      }
      if (!result.retryable) break;
      console.log(`${model} rate limited (${result.status}), trying next model...`);
    }
  }

  // Wait for DB and TheMealDB results
  const [dbResults, mealDBResults] = await Promise.all([dbPromise, mealDBPromise]);

  // Estimate nutrition for TheMealDB recipes (only if we have an API key)
  const enrichedMealDB = mealDBResults.length > 0 && apiKey
    ? await estimateNutritionWithAI(apiKey, mealDBResults)
    : mealDBResults;

  // Deduplicate: remove TheMealDB results that are already saved in DB
  const dbMealDBIds = new Set(dbResults.filter(r => r.mealDBId).map(r => r.mealDBId));
  const dbNames = new Set(dbResults.map(r => r.name.toLowerCase()));
  const uniqueMealDB = enrichedMealDB.filter(r => {
    if (r.mealDBId && dbMealDBIds.has(r.mealDBId)) return false;
    if (dbNames.has(r.name.toLowerCase())) return false;
    return true;
  });

  // Interleave DB + TheMealDB results (mixed, not sorted)
  const dbAndWeb = [];
  const maxWebLen = Math.max(dbResults.length, uniqueMealDB.length);
  for (let i = 0; i < maxWebLen; i++) {
    if (i < dbResults.length) dbAndWeb.push(dbResults[i]);
    if (i < uniqueMealDB.length) dbAndWeb.push(uniqueMealDB[i]);
  }

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

  // Combined: DB+TheMealDB first, then AI after
  const combined = [...dbAndWeb, ...aiRecipes];

  if (combined.length === 0) {
    return jsonResponse({ error: "No recipes found. Please try a different search." }, 502, corsHeaders);
  }

  return jsonResponse({ recipes: combined }, 200, corsHeaders);
}

export async function OPTIONS(request) {
  const origin = request.headers.get("origin");
  const corsHeaders = {};
  if (ALLOWED_ORIGINS.length > 0 && origin && ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(null, {
    status: 204,
    headers: {
      ...SECURITY_HEADERS,
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
