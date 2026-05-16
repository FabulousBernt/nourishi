import { getDb } from "../src/lib/db";

export default async function sitemap() {
  const staticPages = [
    {
      url: "https://theplateful.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://theplateful.app/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://theplateful.app/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://theplateful.app/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let recipePages = [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT slug, created_at FROM recipes ORDER BY created_at DESC LIMIT 1000`;
    recipePages = rows.map(r => ({
      url: `https://theplateful.app/recipe/${r.slug}`,
      lastModified: r.created_at ? new Date(r.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap DB error:", e.message);
  }

  return [...staticPages, ...recipePages];
}
