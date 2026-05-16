import { useState } from 'react';
import Link from 'next/link';
import MacroBar from './MacroBar';
import StarRating from './StarRating';

const SOURCE_BADGE = {
  "Saved": { bg: "#e8f5e9", color: "#2e7d32", label: "✓ Saved" },
  "AI Generated": { bg: "var(--accent-light)", color: "var(--accent)", label: "✦ AI" },
  "TheMealDB": { bg: "#e8f4fd", color: "#1a73e8", label: "🌐 Web" },
};

export default function RecipeCard({ recipe, index, slug }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 18, overflow: "hidden",
      border: "1.5px solid var(--border-light)", boxShadow: "var(--shadow-sm)",
      animation: `fadeSlideUp 0.4s ease ${index * 0.07}s both`,
    }}>
      {recipe.thumbnail && /^https?:\/\//i.test(recipe.thumbnail) && (
        <img
          src={recipe.thumbnail}
          alt={recipe.name}
          style={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      )}
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "20px 20px 16px", textAlign: "left", color: "var(--text)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                {recipe.cuisine || "Recipe"}
              </span>
              {recipe.source && SOURCE_BADGE[recipe.source] && (
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 600,
                  padding: "2px 8px", borderRadius: 10, letterSpacing: 0.3,
                  background: SOURCE_BADGE[recipe.source].bg,
                  color: SOURCE_BADGE[recipe.source].color,
                }}>
                  {SOURCE_BADGE[recipe.source].label}
                </span>
              )}
            </div>
            <h3 style={{ margin: "6px 0 8px", fontSize: 19, fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.25 }}>
              {recipe.name}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
              {recipe.description}
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              {recipe.time && <span>⏱ {recipe.time}</span>}
              {recipe.servings && <span>🍽 {recipe.servings}</span>}
              {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
            </div>
            {(recipe.calories || recipe.protein) && (
              <MacroBar
                calories={recipe.calories}
                protein={recipe.protein}
                carbs={recipe.carbs}
                fat={recipe.fat}
                isApprox={recipe.isApprox}
              />
            )}
          </div>
          <span style={{ fontSize: 20, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)", marginLeft: 12, marginTop: 4 }}>▾</span>
        </div>
      </button>

      {/* Action buttons — always visible */}
      {(slug || (recipe.sourceUrl && /^https?:\/\//i.test(recipe.sourceUrl))) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 20px 16px" }}>
          {slug && (
            <Link
              href={`/recipe/${slug}`}
              style={{
                display: "inline-block", padding: "10px 16px",
                background: "var(--accent)", borderRadius: 10, textDecoration: "none",
                fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 700, color: "#FFFFFF",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              View Full Recipe
            </Link>
          )}
          {recipe.sourceUrl && /^https?:\/\//i.test(recipe.sourceUrl) && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "10px 16px",
                background: "#e8f4fd", borderRadius: 10, textDecoration: "none",
                fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 700, color: "#1a73e8",
              }}
            >
              View Original ↗
            </a>
          )}
        </div>
      )}

      {/* Star rating — always visible */}
      <div style={{ padding: "0 20px 16px" }}>
        <StarRating
          slug={slug}
          recipe={recipe}
          initialRating={recipe.ratingAvg || 0}
          initialCount={recipe.ratingCount || 0}
        />
      </div>

      {open && (
        <div style={{ padding: "0 20px 20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ height: 1, background: "var(--border-light)", marginBottom: 16 }} />

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 8, color: "var(--accent)" }}>Ingredients</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, fontFamily: "var(--font-body)", lineHeight: 1.8, color: "var(--text)" }}>
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div>
              <h4 style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 8, color: "var(--accent)" }}>Instructions</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, fontFamily: "var(--font-body)", lineHeight: 1.8, color: "var(--text)" }}>
                {recipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
