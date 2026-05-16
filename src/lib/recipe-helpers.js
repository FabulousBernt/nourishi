/**
 * Normalize a recipe name for deduplication.
 * Strips articles, punctuation, extra whitespace, and lowercases.
 */
export function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip quantities/measurements from an ingredient string.
 * "200g chicken breast" → "chicken breast"
 * "1/2 cup flour" → "flour"
 */
function stripQuantity(ingredient) {
  return (ingredient || "")
    .toLowerCase()
    .replace(/^[\d\s/.,½¼¾⅓⅔⅛]+/, "")
    .replace(/\b(g|kg|ml|l|oz|lb|lbs|cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|bunch|pinch|clove|cloves|slice|slices|piece|pieces|can|cans|handful|to taste)\b/gi, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Create a fingerprint from ingredients for deduplication.
 * Strips quantities, sorts alphabetically, joins into a single string.
 */
export function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return "";
  return ingredients
    .map(stripQuantity)
    .filter(Boolean)
    .sort()
    .join("|");
}

/**
 * Generate a simple hash string from normalized ingredients.
 * Uses a fast string hash — not cryptographic, just for dedup matching.
 */
export function hashIngredients(ingredients) {
  const normalized = normalizeIngredients(ingredients);
  if (!normalized) return "";
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Convert to unsigned hex, pad to 8 chars
  return (hash >>> 0).toString(16).padStart(8, "0");
}
