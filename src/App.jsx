import { useState, useRef, useEffect, useCallback } from 'react';
import IngredientTag from './components/IngredientTag';
import RecipeCard from './components/RecipeCard';
import MealPlanDay from './components/MealPlanDay';
import LoadingPulse from './components/LoadingPulse';

const TABS = [
  { id: "search", label: "Recipe Search", icon: "🔍" },
  { id: "pantry", label: "Pantry Mode", icon: "🧊" },
  { id: "plan", label: "Meal Plan", icon: "📅" },
];

const PLAN_GOALS = [
  { id: "bulk", label: "Bulk & Build", icon: "💪", desc: "High protein, calorie surplus" },
  { id: "cut", label: "Lean & Cut", icon: "🔥", desc: "Low-cal, high protein" },
  { id: "lowcarb", label: "Low Carb", icon: "🥑", desc: "Keto-friendly meals" },
  { id: "vegprotein", label: "Veggie Protein", icon: "🌱", desc: "Plant-based, protein-rich" },
  { id: "balanced", label: "Balanced", icon: "⚖️", desc: "Wholesome & varied" },
  { id: "mediterranean", label: "Mediterranean", icon: "🫒", desc: "Heart-healthy classics" },
];

const PLAN_DURATIONS = [
  { id: "1week", label: "1 Week" },
  { id: "2weeks", label: "2 Weeks" },
  { id: "1month", label: "1 Month" },
];

export default function App() {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingInput, setIngInput] = useState("");
  const [goal, setGoal] = useState(null);
  const [duration, setDuration] = useState("1week");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { setResults(null); setError(null); }, [tab]);

  const callAI = useCallback(async (systemPrompt, userPrompt, useWebSearch = false) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt, useWebSearch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
      const jsonMatch = data.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Could not parse recipes");
      const parsed = JSON.parse(jsonMatch[0]);
      setResults(parsed);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRecipes = () => {
    if (!query.trim()) return;
    callAI(
      `You are a world-class chef and recipe search engine. Search the web to find real recipes matching the user's query. For each recipe you find, extract the full details from the source. Return ONLY a JSON array of 4-6 recipe objects. Each object must have: name, description (1 sentence), cuisine, time (string like "30 min"), servings (string like "4 servings"), calories (number, total per serving — if the source doesn't list it, estimate it and set isApprox to true), protein (number in grams per serving), carbs (number in grams per serving), fat (number in grams per serving), isApprox (boolean — false if nutrition data comes from the source, true if you estimated it), difficulty ("Easy"/"Medium"/"Hard"), ingredients (array of strings with quantities), instructions (array of step strings), sourceUrl (the URL of the original recipe page, or null), sourceName (name of the website, or null). ALWAYS provide calories, protein, carbs, and fat — estimate if needed and mark isApprox true. No markdown, no explanation, ONLY the JSON array.`,
      `Find recipes matching: "${query}"`,
      true
    );
  };

  const searchByIngredients = () => {
    if (ingredients.length === 0) return;
    callAI(
      `You are a resourceful chef who finds real recipes using available ingredients. Search the web to find real recipes that use primarily the given ingredients (1-2 common pantry additions are fine). Return ONLY a JSON array of 4-6 recipe objects. Each object must have: name, description (1 sentence), cuisine, time (string like "30 min"), servings (string like "4 servings"), calories (number, total per serving — estimate if needed), protein (number in grams per serving), carbs (number in grams per serving), fat (number in grams per serving), isApprox (boolean — false if from source, true if estimated), difficulty, ingredients (array with quantities, mark any additions with "* "), instructions (array of steps), sourceUrl (the URL of the original recipe page, or null), sourceName (name of the website, or null). ALWAYS provide calories, protein, carbs, and fat — estimate if needed and mark isApprox true. No markdown, no explanation, ONLY the JSON array.`,
      `I have these ingredients: ${ingredients.join(", ")}. Find real recipes I can make with these.`,
      true
    );
  };

  const generateMealPlan = () => {
    if (!goal) return;
    const goalInfo = PLAN_GOALS.find(g => g.id === goal);
    const durInfo = PLAN_DURATIONS.find(d => d.id === duration);
    const days = duration === "1week" ? 7 : duration === "2weeks" ? 14 : 30;
    callAI(
      `You are an expert nutritionist and meal planner. Return ONLY a JSON array of ${days} day objects. Each object must have: day (string like "Day 1 - Monday"), totalCalories (number), totalProtein (number, grams), totalCarbs (number, grams), totalFat (number, grams), and for each meal an object instead of a string: breakfast (object with: name, calories, protein, carbs, fat), lunch (same structure), dinner (same structure), snack (same structure). All nutrition values are approximate estimates. Tailor everything to the goal. No markdown, ONLY the JSON array.`,
      `Create a ${durInfo.label} meal plan for the goal: ${goalInfo.label} - ${goalInfo.desc}. Make it varied, practical, and delicious.`
    );
  };

  const addIngredient = () => {
    const val = ingInput.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients(prev => [...prev, val]);
      setIngInput("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-body)",
      maxWidth: 520,
      margin: "0 auto",
      padding: "0 0 100px",
      position: "relative",
    }}>
      {/* Header */}
      <header style={{
        padding: "44px 24px 24px",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--accent-light)", padding: "6px 16px", borderRadius: 20,
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 14 }}>🍽</span>
          <span style={{ fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--accent)", letterSpacing: 0.5 }}>
            AI-Powered Recipe Discovery
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 38, margin: "0 0 6px", color: "var(--text)",
          fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.5,
        }}>
          Meal<span style={{ color: "var(--accent)" }}>Muse</span>
        </h1>
        <div style={{
          width: 40, height: 3, background: "var(--gold)", borderRadius: 2,
          margin: "0 auto",
        }} />
      </header>

      {/* Tab Nav */}
      <nav style={{ display: "flex", gap: 6, padding: "0 16px", marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "14px 8px 12px", borderRadius: 16,
            border: tab === t.id ? "1.5px solid var(--accent)" : "1.5px solid var(--border-light)",
            background: tab === t.id ? "var(--accent)" : "var(--surface)",
            color: tab === t.id ? "#FFFFFF" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.25s",
            boxShadow: tab === t.id ? "var(--shadow-md)" : "var(--shadow-sm)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-body)", letterSpacing: 0.5 }}>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: "0 16px" }}>
        {/* Recipe Search */}
        {tab === "search" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
              Describe what you're craving — a cuisine, a flavor, a mood. MealMuse will find the perfect recipes.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchRecipes()}
                  placeholder="Spicy chicken and rice bowls..."
                  style={{
                    width: "100%", padding: "14px 42px 14px 18px", borderRadius: 14,
                    border: "1.5px solid var(--border-light)", background: "var(--surface)",
                    color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
                    outline: "none", transition: "all 0.2s",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
                  onBlur={e => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "var(--shadow-sm)"; }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "var(--border-light)", border: "none", borderRadius: "50%",
                    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 13, color: "var(--text-muted)", lineHeight: 1,
                    fontFamily: "var(--font-body)", fontWeight: 700, padding: 0,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#FFFFFF"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--border-light)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >×</button>
                )}
              </div>
              <button onClick={searchRecipes} disabled={loading || !query.trim()} style={{
                padding: "14px 22px", borderRadius: 14, border: "none",
                background: query.trim() ? "var(--accent)" : "var(--border-light)",
                color: query.trim() ? "#FFFFFF" : "var(--text-muted)",
                fontWeight: 800, fontSize: 15, fontFamily: "var(--font-body)",
                cursor: query.trim() ? "pointer" : "default", transition: "all 0.2s",
                boxShadow: query.trim() ? "var(--shadow-md)" : "none",
              }}>
                Go
              </button>
            </div>
          </div>
        )}

        {/* Pantry Mode */}
        {tab === "pantry" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
              Add the ingredients you have on hand, and MealMuse will craft recipes around them.
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={ingInput}
                onChange={e => setIngInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addIngredient(); }}
                placeholder="Add an ingredient..."
                style={{
                  flex: 1, padding: "14px 18px", borderRadius: 14,
                  border: "1.5px solid var(--border-light)", background: "var(--surface)",
                  color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
                  outline: "none", transition: "all 0.2s",
                  boxShadow: "var(--shadow-sm)",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "var(--shadow-sm)"; }}
              />
              <button onClick={addIngredient} style={{
                padding: "14px 18px", borderRadius: 14,
                background: "var(--surface)", color: "var(--accent)",
                fontWeight: 800, fontSize: 20, fontFamily: "var(--font-body)",
                cursor: "pointer", border: "1.5px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}>+</button>
            </div>
            {ingredients.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
                {ingredients.map(ing => (
                  <IngredientTag key={ing} text={ing} onRemove={() => setIngredients(prev => prev.filter(i => i !== ing))} />
                ))}
                <button onClick={() => { setIngredients([]); setResults(null); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 700,
                  color: "var(--danger)", padding: "6px 10px", borderRadius: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#FDF0EE"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
                >Clear all</button>
              </div>
            )}
            {ingredients.length > 0 && (
              <button onClick={searchByIngredients} disabled={loading} style={{
                width: "100%", padding: "16px", borderRadius: 50, border: "none",
                background: "var(--accent)", color: "#FFFFFF",
                fontWeight: 800, fontSize: 16, fontFamily: "var(--font-body)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "var(--shadow-md)",
              }}>
                Find Recipes with {ingredients.length} ingredient{ingredients.length > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* Meal Plan */}
        {tab === "plan" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
              Choose your nutrition goal and timeframe. MealMuse will generate a complete meal plan.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {PLAN_GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} style={{
                  padding: "16px 14px", borderRadius: 16, textAlign: "left",
                  border: goal === g.id ? "1.5px solid var(--accent)" : "1.5px solid var(--border-light)",
                  background: goal === g.id ? "var(--accent-light)" : "var(--surface)",
                  color: "var(--text)", cursor: "pointer", transition: "all 0.25s",
                  boxShadow: goal === g.id ? "var(--shadow-md)" : "var(--shadow-sm)",
                }}>
                  <span style={{ fontSize: 24 }}>{g.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", marginTop: 6 }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 2 }}>{g.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {PLAN_DURATIONS.map(d => (
                <button key={d.id} onClick={() => setDuration(d.id)} style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  border: duration === d.id ? "1.5px solid var(--accent)" : "1.5px solid var(--border-light)",
                  background: duration === d.id ? "var(--accent-light)" : "var(--surface)",
                  color: duration === d.id ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)",
                  cursor: "pointer", transition: "all 0.25s",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  {d.label}
                </button>
              ))}
            </div>
            {goal && (
              <button onClick={generateMealPlan} disabled={loading} style={{
                width: "100%", padding: "16px", borderRadius: 50, border: "none",
                background: "var(--accent)", color: "#FFFFFF",
                fontWeight: 800, fontSize: 16, fontFamily: "var(--font-body)",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "var(--shadow-md)",
              }}>
                Generate {PLAN_DURATIONS.find(d => d.id === duration)?.label} Plan
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <LoadingPulse text={
            tab === "plan" ? "Crafting your personalized meal plan..." :
            tab === "pantry" ? "Finding recipes with your ingredients..." :
            "Searching for the perfect recipes..."
          } />
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24, padding: 20, borderRadius: 14,
            background: "#FDECEA", border: "1px solid #F5C6CB",
            color: "var(--danger)", fontSize: 14, fontFamily: "var(--font-body)",
            textAlign: "center", lineHeight: 1.6,
          }}>
            {error}
            <br />
            <button onClick={() => setError(null)} style={{
              marginTop: 12, padding: "8px 20px", borderRadius: 10, border: "1px solid var(--danger)",
              background: "transparent", color: "var(--danger)", cursor: "pointer",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
            }}>Dismiss</button>
          </div>
        )}

        {/* Results: Recipes */}
        {results && (tab === "search" || tab === "pantry") && (
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 4px", color: "var(--text)" }}>
              {tab === "pantry" ? "Here's what you can make" : "Recipes Found"}
            </h2>
            {results.map((r, i) => <RecipeCard key={i} recipe={r} index={i} />)}
          </div>
        )}

        {/* Results: Meal Plan */}
        {results && tab === "plan" && (
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 4px", color: "var(--text)" }}>
              Your {PLAN_GOALS.find(g => g.id === goal)?.label} Plan
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px", fontFamily: "var(--font-body)" }}>
              Tap any day to see the full breakdown.
            </p>
            {results.map((day, i) => <MealPlanDay key={i} day={day} index={i} />)}
          </div>
        )}
      </main>
    </div>
  );
}
