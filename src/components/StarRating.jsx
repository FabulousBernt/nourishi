import { useState, useEffect } from "react";

export default function StarRating({ slug, recipe, initialRating = 0, initialCount = 0 }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);

  // Load user's previous rating from localStorage
  useEffect(() => {
    try {
      const rated = JSON.parse(localStorage.getItem("plateful_ratings") || "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rated[slug]) setUserRating(rated[slug]);
    } catch (_e) { /* localStorage unavailable */ }
  }, [slug]);

  const submitRating = async (stars) => {
    if (submitting || stars === userRating) return;
    setSubmitting(true);
    setUserRating(stars);

    // Save to localStorage immediately
    try {
      const rated = JSON.parse(localStorage.getItem("plateful_ratings") || "{}");
      rated[slug] = stars;
      localStorage.setItem("plateful_ratings", JSON.stringify(rated));
    } catch (_e) { /* localStorage unavailable */ }

    try {
      const res = await fetch("/api/recipes/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stars, recipe }),
      });
      if (res.ok) {
        const data = await res.json();
        setAvgRating(data.averageRating);
        setRatingCount(data.ratingCount);
        // Recipe saved to DB if data.saved is true (no UI feedback needed)
      }
    } catch (_e) {
      // Rating failed silently — localStorage still has the user's rating
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoveredStar || userRating || Math.round(avgRating);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
      <div
        style={{ display: "flex", gap: 2, cursor: submitting ? "default" : "pointer" }}
        onMouseLeave={() => setHoveredStar(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            role="button"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => submitRating(star)}
            onMouseEnter={() => !submitting && setHoveredStar(star)}
            style={{
              fontSize: 20,
              transition: "transform 0.15s, color 0.15s",
              transform: hoveredStar === star ? "scale(1.2)" : "scale(1)",
              color: star <= displayRating ? "#F5A623" : "var(--border-light)",
              userSelect: "none",
            }}
          >
            ★
          </span>
        ))}
      </div>
      {ratingCount > 0 && (
        <span style={{
          fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)",
        }}>
          {avgRating.toFixed(1)} ({ratingCount})
        </span>
      )}
    </div>
  );
}
