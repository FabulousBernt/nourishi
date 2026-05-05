import { useState } from 'react';

const mealIcons = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };
const meals = ["breakfast", "lunch", "dinner", "snack"];

export default function MealPlanDay({ day, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: "var(--card-bg)", borderRadius: 18, border: "1.5px solid var(--border-light)",
      boxShadow: "var(--shadow-sm)",
      animation: `fadeSlideUp 0.4s ease ${index * 0.05}s both`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: 16, textAlign: "left", color: "var(--text)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{day.day}</span>
            <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>{day.totalCalories || "—"} cal</span>
              {day.totalProtein && <span><span style={{ color: "var(--macro-protein)" }}>P:</span> {day.totalProtein}g</span>}
              {day.totalCarbs && <span><span style={{ color: "var(--macro-carbs)" }}>C:</span> {day.totalCarbs}g</span>}
              {day.totalFat && <span><span style={{ color: "var(--macro-fat)" }}>F:</span> {day.totalFat}g</span>}
            </div>
          </div>
          <span style={{ fontSize: 18, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", animation: "fadeIn 0.3s ease" }}>
          {meals.map(meal => {
            const m = day[meal];
            if (!m) return null;
            const isObj = typeof m === "object";
            return (
              <div key={meal} style={{ marginBottom: 10, padding: 14, background: "var(--accent-light)", borderRadius: 12, border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--accent)" }}>
                    {mealIcons[meal]} {meal}
                  </span>
                  {isObj && m.calories && (
                    <span style={{ fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--text)" }}>
                      {m.calories} cal
                    </span>
                  )}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--text)", lineHeight: 1.5 }}>
                  {isObj ? m.name : m}
                </p>
                {isObj && (m.protein || m.carbs || m.fat) && (
                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
                    {m.protein != null && <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "var(--macro-protein)", marginRight: 3, verticalAlign: "middle" }} />P: {m.protein}g</span>}
                    {m.carbs != null && <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "var(--macro-carbs)", marginRight: 3, verticalAlign: "middle" }} />C: {m.carbs}g</span>}
                    {m.fat != null && <span><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 1, background: "var(--macro-fat)", marginRight: 3, verticalAlign: "middle" }} />F: {m.fat}g</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
