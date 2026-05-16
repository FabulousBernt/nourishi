export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function makeRecipeSlug(recipe) {
  const base = slugify(recipe.name || "recipe");
  // For TheMealDB recipes, use the mealDBId or extract from sourceUrl
  if (recipe.mealDBId) return `${base}-${recipe.mealDBId}`;
  if (recipe.source === "TheMealDB" && recipe.sourceUrl) {
    const idMatch = recipe.sourceUrl.match(/(\d+)/);
    if (idMatch) return `${base}-${idMatch[1]}`;
  }
  // For AI recipes, use an 8-char hash from name + cuisine + first ingredient
  const fingerprint = [
    recipe.name || "",
    recipe.cuisine || "",
    Array.isArray(recipe.ingredients) ? recipe.ingredients[0] || "" : "",
  ].join("|");
  const hash = Array.from(fingerprint)
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `${base}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
