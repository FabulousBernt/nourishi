"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MacroBar from "../../../src/components/MacroBar";
import StarRating from "../../../src/components/StarRating";

const SOURCE_BADGE = {
  "Saved": { bg: "#e8f5e9", color: "#2e7d32", label: "\u2713 Saved" },
  "AI Generated": { bg: "var(--accent-light)", color: "var(--accent)", label: "\u2726 AI" },
  "TheMealDB": { bg: "#e8f4fd", color: "#1a73e8", label: "\ud83c\udf10 Web" },
};

export default function RecipePageClient({ slug, serverRecipe }) {
  const [recipe, setRecipe] = useState(serverRecipe || null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (serverRecipe) return;
    // Load from localStorage (AI-generated recipes stored by the homepage)
    try {
      const stored = JSON.parse(localStorage.getItem("plateful_recipes") || "{}");
      const found = stored[slug];
      if (found) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from external storage on mount
        setRecipe(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [slug, serverRecipe]);

  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-body)", padding: 24,
      }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text)", marginBottom: 12 }}>
          Recipe Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 24, textAlign: "center" }}>
          This recipe may have been generated in a previous session and is no longer available.
        </p>
        <Link href="/" style={{
          padding: "12px 24px", borderRadius: 14, background: "var(--accent)",
          color: "#FFFFFF", textDecoration: "none", fontWeight: 700,
          fontFamily: "var(--font-body)", fontSize: 15,
        }}>
          Back to The Plateful
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 48, animation: "bounce 0.6s ease-in-out infinite" }}>🍽</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)",
      maxWidth: 600, margin: "0 auto", padding: "0 0 60px",
    }}>
      {/* Back nav */}
      <div style={{ padding: "16px 20px" }}>
        <Link href="/" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: 14,
          fontWeight: 600, fontFamily: "var(--font-body)",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          ← Back to The Plateful
        </Link>
      </div>

      {/* Thumbnail */}
      {recipe.thumbnail && /^https?:\/\//i.test(recipe.thumbnail) && (
        <img
          src={recipe.thumbnail}
          alt={recipe.name}
          style={{ width: "100%", height: 260, objectFit: "cover" }}
        />
      )}

      {/* Content */}
      <div style={{ padding: "24px 20px" }}>
        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 13, color: "var(--accent)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 1,
          }}>
            {recipe.cuisine || "Recipe"}
          </span>
          {recipe.source && SOURCE_BADGE[recipe.source] && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, letterSpacing: 0.3,
              background: SOURCE_BADGE[recipe.source].bg,
              color: SOURCE_BADGE[recipe.source].color,
            }}>
              {SOURCE_BADGE[recipe.source].label}
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
          color: "var(--text)", margin: "0 0 10px", lineHeight: 1.2,
        }}>
          {recipe.name}
        </h1>

        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {recipe.description}
        </p>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 16, fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
          {recipe.time && <span>⏱ {recipe.time}</span>}
          {recipe.servings && <span>🍽 {recipe.servings}</span>}
          {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
        </div>

        {/* Macros */}
        {(recipe.calories || recipe.protein) && (
          <MacroBar
            calories={recipe.calories}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fat={recipe.fat}
            isApprox={recipe.isApprox}
          />
        )}

        {/* Star Rating */}
        <StarRating
          slug={slug}
          recipe={recipe}
          initialRating={recipe.ratingAvg || 0}
          initialCount={recipe.ratingCount || 0}
        />

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{
              fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 700,
              color: "var(--accent)", marginBottom: 12,
            }}>
              Ingredients
            </h2>
            <ul style={{
              margin: 0, paddingLeft: 20, fontSize: 15,
              lineHeight: 2, color: "var(--text)",
            }}>
              {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{
              fontSize: 18, fontFamily: "var(--font-display)", fontWeight: 700,
              color: "var(--accent)", marginBottom: 12,
            }}>
              Instructions
            </h2>
            <ol style={{
              margin: 0, paddingLeft: 20, fontSize: 15,
              lineHeight: 2, color: "var(--text)",
            }}>
              {recipe.instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Source link */}
        {recipe.sourceUrl && /^https?:\/\//i.test(recipe.sourceUrl) && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", marginTop: 24, padding: "10px 18px",
              background: "#e8f4fd", borderRadius: 12, textDecoration: "none",
              fontSize: 13, fontWeight: 600, color: "#1a73e8",
            }}
          >
            View Original Recipe ↗
          </a>
        )}
      </div>
    </div>
  );
}
