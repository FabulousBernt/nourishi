import { checkRateLimit } from "../../../../src/lib/api-helpers.js";
import { getDb } from "../../../../src/lib/db.js";
import { normalizeName, hashIngredients } from "../../../../src/lib/recipe-helpers.js";
import { makeRecipeSlug } from "../../../../src/lib/slugify.js";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Type": "application/json",
};

function jsonResponse(body, status = 200) {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

// Simple hash of IP for vote deduplication (not cryptographic, just fingerprinting)
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash + ip.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return jsonResponse({ error: "Too many requests. Please wait a moment." }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { slug, stars, recipe } = body || {};

  // Validate rating
  if (!slug || typeof slug !== "string") {
    return jsonResponse({ error: "Missing slug" }, 400);
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return jsonResponse({ error: "Rating must be 1-5" }, 400);
  }
  if (!recipe || typeof recipe.name !== "string") {
    return jsonResponse({ error: "Missing recipe data" }, 400);
  }

  const sql = getDb();
  const ipHash = hashIP(ip);

  // Upsert rating (one vote per IP per recipe)
  await sql`
    INSERT INTO ratings (recipe_slug, ip_hash, stars)
    VALUES (${slug}, ${ipHash}, ${stars})
    ON CONFLICT (recipe_slug, ip_hash)
    DO UPDATE SET stars = ${stars}, created_at = now()
  `;

  // Calculate current average
  const [stats] = await sql`
    SELECT COALESCE(SUM(stars), 0) as total, COUNT(*) as count
    FROM ratings WHERE recipe_slug = ${slug}
  `;
  const ratingCount = Number(stats.count);
  const ratingSum = Number(stats.total);
  const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

  // Check if recipe already exists in DB
  const [existing] = await sql`
    SELECT id FROM recipes WHERE slug = ${slug} LIMIT 1
  `;

  let saved = false;

  if (existing) {
    // Update rating stats on existing recipe
    await sql`
      UPDATE recipes SET rating_sum = ${ratingSum}, rating_count = ${ratingCount}
      WHERE slug = ${slug}
    `;

    // Remove if average drops below 3.0 with 3+ ratings
    if (ratingCount >= 3 && averageRating < 3.0) {
      await sql`DELETE FROM recipes WHERE slug = ${slug}`;
    }
  } else if (averageRating >= 4.0) {
    // Recipe qualifies for saving — check for duplicates first
    const nameNorm = normalizeName(recipe.name);
    const ingHash = hashIngredients(recipe.ingredients || []);

    const [duplicate] = await sql`
      SELECT id, slug FROM recipes
      WHERE name_normalized = ${nameNorm} AND ingredients_hash = ${ingHash}
      LIMIT 1
    `;

    if (duplicate) {
      // Duplicate exists — update its ratings instead
      await sql`
        UPDATE recipes SET rating_sum = rating_sum + ${stars}, rating_count = rating_count + 1
        WHERE id = ${duplicate.id}
      `;
    } else {
      // Insert new recipe
      const recipeSlug = makeRecipeSlug(recipe);
      const source = recipe.source === "TheMealDB" ? "mealdb" : "ai";

      await sql`
        INSERT INTO recipes (
          slug, name, name_normalized, ingredients_hash, description, cuisine,
          source, time, servings, difficulty, calories, protein, carbs, fat,
          is_approx, ingredients, instructions, thumbnail, source_url, mealdb_id,
          rating_sum, rating_count
        ) VALUES (
          ${recipeSlug}, ${recipe.name}, ${nameNorm}, ${ingHash},
          ${recipe.description || null}, ${recipe.cuisine || null},
          ${source}, ${recipe.time || null}, ${recipe.servings || null},
          ${recipe.difficulty || null}, ${recipe.calories || null},
          ${recipe.protein || null}, ${recipe.carbs || null}, ${recipe.fat || null},
          ${recipe.isApprox ?? true},
          ${JSON.stringify(recipe.ingredients || [])},
          ${JSON.stringify(recipe.instructions || [])},
          ${recipe.thumbnail || null}, ${recipe.sourceUrl || null},
          ${recipe.mealDBId || null},
          ${ratingSum}, ${ratingCount}
        )
        ON CONFLICT (slug) DO UPDATE SET
          rating_sum = ${ratingSum}, rating_count = ${ratingCount}
      `;
      saved = true;
    }
  }

  return jsonResponse({ averageRating, ratingCount, saved });
}
