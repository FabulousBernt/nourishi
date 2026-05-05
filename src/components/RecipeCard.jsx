import { useState } from 'react';
import MacroBar from './MacroBar';

export default function RecipeCard({ recipe, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 18, overflow: "hidden",
      border: "1.5px solid var(--border-light)", boxShadow: "var(--shadow-sm)",
      animation: `fadeSlideUp 0.4s ease ${index * 0.07}s both`,
    }}>
      {recipe.thumbnail && (
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
              {recipe.source && (
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 600,
                  padding: "2px 8px", borderRadius: 10, letterSpacing: 0.3,
                  background: recipe.source === "AI Generated" ? "var(--accent-light)" : "#e8f4fd",
                  color: recipe.source === "AI Generated" ? "var(--accent)" : "#1a73e8",
                }}>
                  {recipe.source === "AI Generated" ? "✦ AI" : "🌐 Web"}
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

          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", marginTop: 14, padding: "8px 14px",
                background: "#e8f4fd", borderRadius: 10, textDecoration: "none",
                fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600, color: "#1a73e8",
              }}
            >
              View Original Recipe ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
