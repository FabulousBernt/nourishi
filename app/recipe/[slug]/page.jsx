import { transformMealDBRecipe } from "../../../src/lib/api-helpers";
import RecipePageClient from "./RecipePageClient";

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
  const recipe = await fetchMealDBRecipe(slug);

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
  const serverRecipe = await fetchMealDBRecipe(slug);

  return (
    <>
      {serverRecipe && <RecipeJsonLd recipe={serverRecipe} />}
      <RecipePageClient slug={slug} serverRecipe={serverRecipe} />
    </>
  );
}
