import { useState, useEffect } from 'react';

const FOOD_ICONS = ["🥗", "🍜", "🍔", "🍕", "🍣", "🌮", "🥘", "🍝", "🍲", "🥙", "🍛", "🧆"];

const LOADING_VERBS = [
  "Cooking up something delicious",
  "Tossing the ingredients",
  "Frying up ideas",
  "Simmering the possibilities",
  "Whisking through recipes",
  "Seasoning the results",
  "Chopping through options",
  "Grilling the details",
  "Sautéing some inspiration",
  "Plating your dishes",
  "Marinating the flavors",
  "Blending the perfect mix",
];

export default function LoadingPulse() {
  const [iconIndex, setIconIndex] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);

  useEffect(() => {
    const iconTimer = setInterval(() => {
      setIconIndex(i => (i + 1) % FOOD_ICONS.length);
    }, 800);
    const verbTimer = setInterval(() => {
      setVerbIndex(i => (i + 1) % LOADING_VERBS.length);
    }, 2500);
    return () => { clearInterval(iconTimer); clearInterval(verbTimer); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
      <span style={{
        fontSize: 48,
        animation: "bounce 0.6s ease-in-out infinite",
        display: "inline-block",
      }}>
        {FOOD_ICONS[iconIndex]}
      </span>
      <p style={{
        fontSize: 15, color: "var(--text-muted)", fontFamily: "var(--font-body)",
        textAlign: "center", transition: "opacity 0.3s",
      }}>
        {LOADING_VERBS[verbIndex]}...
      </p>
    </div>
  );
}
