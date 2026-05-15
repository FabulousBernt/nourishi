export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function makeRecipeSlug(recipe) {
  const base = slugify(recipe.name || "recipe");
  // For TheMealDB recipes, append a stable identifier from the sourceUrl
  if (recipe.source === "TheMealDB" && recipe.sourceUrl) {
    const idMatch = recipe.sourceUrl.match(/(\d+)/);
    if (idMatch) return `${base}-${idMatch[1]}`;
  }
  // For AI recipes, append a short hash from the name
  const hash = Array.from(recipe.name || "")
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString(36)
    .replace("-", "");
  return `${base}-${hash.slice(0, 4)}`;
}
