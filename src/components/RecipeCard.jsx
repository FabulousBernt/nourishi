import { useState } from 'react';
import MacroBar from './MacroBar';

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function RecipeCard({ recipe, index }) {
  const [open, setOpen] = useState(false);
  const safeUrl = isValidUrl(recipe.sourceUrl) ? recipe.sourceUrl : null;

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 18, overflow: "hidden",
      border: "1.5px solid var(--border-light)", boxShadow: "var(--shadow-sm)",
      animation: `fadeSlideUp 0.4s ease ${index * 0.07}s both`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "20px 20px 16px", textAlign: "left", color: "var(--text)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              {recipe.cuisine || "Recipe"}
            </span>
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
            <MacroBar
              calories={recipe.calories}
              protein={recipe.protein}
              carbs={recipe.carbs}
              fat={recipe.fat}
              isApprox={recipe.isApprox}
            />
          </div>
          <span style={{ fontSize: 20, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)", marginLeft: 12, marginTop: 4 }}>▾</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ height: 1, background: "var(--border-light)", marginBottom: 16 }} />

          {recipe.ingredients && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 8, color: "var(--accent)" }}>Ingredients</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, fontFamily: "var(--font-body)", lineHeight: 1.8, color: "var(--text)" }}>
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}

          {recipe.instructions && (
            <div>
              <h4 style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 700, marginBottom: 8, color: "var(--accent)" }}>Instructions</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, fontFamily: "var(--font-body)", lineHeight: 1.8, color: "var(--text)" }}>
                {recipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
              </ol>
            </div>
          )}

          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 14, padding: "12px 16px", background: "var(--accent-dim)",
                borderRadius: 12, textDecoration: "none", transition: "all 0.2s",
                border: "1px solid transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
            >
              <span style={{ fontSize: 16 }}>🔗</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-body)", color: "var(--accent)" }}>
                  {recipe.sourceName || "View Original Recipe"}
                </div>
                <div style={{
                  fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-body)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {safeUrl}
                </div>
              </div>
              <span style={{ fontSize: 14, color: "var(--accent)" }}>↗</span>
            </a>
          )}

          {!safeUrl && (
            <div style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 12,
              fontSize: 12, fontFamily: "var(--font-body)", color: "var(--text-muted)",
              background: "var(--accent-light)", fontStyle: "italic", textAlign: "center",
            }}>
              AI-generated recipe — no specific web source
            </div>
          )}
        </div>
      )}
    </div>
  );
}
