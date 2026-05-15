// Simple in-memory rate limiter (per Vercel instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per IP per minute
const RATE_LIMIT_MAX_ENTRIES = 10000; // prevent unbounded map growth

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

export function isBlockedContent(str) {
  return typeof str === "string" && blockedRegex.test(str);
}

// Sanitize user-provided text: strip control chars and limit length
export function sanitizeInput(str, maxLen = 500) {
  if (typeof str !== "string") return "";
  // Remove control characters (except newline/tab), null bytes, and non-printable chars
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen).trim();
}

export function checkRateLimit(ip) {
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

// Transform a TheMealDB meal object into our recipe schema
export function transformMealDBRecipe(meal) {
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
    mealDBId: meal.idMeal || null,
  };
}
