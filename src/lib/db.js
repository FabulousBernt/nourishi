import { neon } from "@neondatabase/serverless";

let sql;

export function getDb() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured");
    sql = neon(url);
  }
  return sql;
}
