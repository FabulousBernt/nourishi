import { transformMealDBRecipe } from "../../../src/lib/api-helpers";
import { getDb } from "../../../src/lib/db";
import RecipePageClient from "./RecipePageClient";

// Try to fetch recipe from the database first
async function fetchFromDB(slug) {
  try {
    const sql = getDb();
    const [row] = await sql`SELECT * FROM recipes WHERE slug = ${slug} LIMIT 1`;
    if (!row) return null;
    return {
      name: row.name,
      description: row.description,
      cuisine: row.cuisine,
      source: "Saved",
      time: row.time,
      servings: row.servings,
      difficulty: row.difficulty,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      isApprox: row.is_approx,
      ingredients: typeof row.ingredients === "string" ? JSON.parse(row.ingredients) : row.ingredients,
      instructions: typeof row.instructions === "string" ? JSON.parse(row.instructions) : row.instructions,
      thumbnail: row.thumbnail,
      sourceUrl: row.source_url,
      mealDBId: row.mealdb_id,
      ratingAvg: row.rating_count > 0 ? row.rating_sum / row.rating_count : 0,
      ratingCount: row.rating_count,
    };
  } catch (e) {
    console.error("DB recipe fetch error:", e.message);
    return null;
  }
}

// Try to fetch a TheMealDB recipe by extracting an ID from the slug
async function fetchMealDBRecipe(slug) {
  // Slugs for TheMealDB recipes end with the numeric ID, e.g. "creamy-tuscan-chicken-52772"
  const idMatch = slug.match(/-(\d{4,})$/);
  if (!idMatch) return null;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMatch[1]}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.meals?.[0]) return null;
    return transformMealDBRecipe(data.meals[0]);
  } catch {
    return null;
  }
}

// Fetch recipe: DB first, then TheMealDB fallback
async function fetchRecipe(slug) {
  const dbRecipe = await fetchFromDB(slug);
  if (dbRecipe) return dbRecipe;
  return fetchMealDBRecipe(slug);
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+)/);
  if (!match) return null;
  return `PT${match[1]}M`;
}

function RecipeJsonLd({ recipe }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    ...(recipe.thumbnail && { image: recipe.thumbnail }),
    author: { "@type": "Organization", name: "The Plateful" },
    datePublished: new Date().toISOString().split("T")[0],
    ...(recipe.time && { totalTime: parseTime(recipe.time) }),
    ...(recipe.servings && { recipeYield: recipe.servings }),
    ...(recipe.cuisine && { recipeCuisine: recipe.cuisine }),
    ...(recipe.calories && {
      nutrition: {
        "@type": "NutritionInformation",
        calories: `${recipe.calories} calories`,
        ...(recipe.protein && { proteinContent: `${recipe.protein}g` }),
        ...(recipe.carbs && { carbohydrateContent: `${recipe.carbs}g` }),
        ...(recipe.fat && { fatContent: `${recipe.fat}g` }),
      },
    }),
    ...(recipe.ingredients && {
      recipeIngredient: recipe.ingredients,
    }),
    ...(recipe.instructions && {
      recipeInstructions: recipe.instructions.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text: step,
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const recipe = await fetchRecipe(slug);

  if (recipe) {
    return {
      title: recipe.name,
      description: recipe.description,
      openGraph: {
        title: `${recipe.name} | The Plateful`,
        description: recipe.description,
        images: recipe.thumbnail ? [recipe.thumbnail] : ["/og-image.png"],
        type: "article",
      },
    };
  }

  // For AI recipes (no server data), use generic metadata
  const prettyName = slug
    .replace(/-[a-z0-9]{1,6}$/, "") // remove hash suffix
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: prettyName,
    description: `${prettyName} — a recipe from The Plateful.`,
    openGraph: {
      title: `${prettyName} | The Plateful`,
      description: `${prettyName} — a recipe from The Plateful.`,
      images: ["/og-image.png"],
      type: "article",
    },
  };
}

export default async function RecipePage({ params }) {
  const { slug } = await params;
  const serverRecipe = await fetchRecipe(slug);

  return (
    <>
      {serverRecipe && <RecipeJsonLd recipe={serverRecipe} />}
      <RecipePageClient slug={slug} serverRecipe={serverRecipe} />
    </>
  );
}
