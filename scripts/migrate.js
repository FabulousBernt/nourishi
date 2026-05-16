/**
 * Database migration script for The Plateful.
 * Run with: node scripts/migrate.js
 * Requires DATABASE_URL environment variable.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id                SERIAL PRIMARY KEY,
      slug              TEXT UNIQUE NOT NULL,
      name              TEXT NOT NULL,
      name_normalized   TEXT NOT NULL,
      ingredients_hash  TEXT NOT NULL,
      description       TEXT,
      cuisine           TEXT,
      source            TEXT NOT NULL,
      time              TEXT,
      servings          TEXT,
      difficulty        TEXT,
      calories          INTEGER,
      protein           INTEGER,
      carbs             INTEGER,
      fat               INTEGER,
      is_approx         BOOLEAN DEFAULT true,
      ingredients       JSONB NOT NULL DEFAULT '[]',
      instructions      JSONB NOT NULL DEFAULT '[]',
      thumbnail         TEXT,
      source_url        TEXT,
      mealdb_id         TEXT UNIQUE,
      rating_sum        INTEGER DEFAULT 0,
      rating_count      INTEGER DEFAULT 0,
      created_at        TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ratings (
      id          SERIAL PRIMARY KEY,
      recipe_slug TEXT NOT NULL,
      ip_hash     TEXT NOT NULL,
      stars       INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
      created_at  TIMESTAMPTZ DEFAULT now(),
      UNIQUE (recipe_slug, ip_hash)
    )
  `;

  // Create indexes (IF NOT EXISTS for idempotency)
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes (slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_mealdb_id ON recipes (mealdb_id) WHERE mealdb_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_name_normalized ON recipes (name_normalized)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_ingredients_hash ON recipes (ingredients_hash)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ratings_recipe_slug ON ratings (recipe_slug)`;

  console.log("Migrations complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
