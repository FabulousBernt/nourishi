import { useEffect } from "react";

const PAGES = {
  about: {
    title: "About The Plateful",
    content: () => (
      <>
        <p>
          The Plateful is an AI-powered recipe discovery app designed to make cooking more
          accessible, creative, and fun. Here's what each section does:
        </p>

        <h3>Recipe Search</h3>
        <p>
          Describe a dish, cuisine, or craving in your own words and The Plateful will generate
          tailored recipe suggestions. Results combine real recipes from the web (via TheMealDB)
          with AI-generated recipes, each with full ingredients, step-by-step instructions, and
          estimated nutrition information.
        </p>

        <h3>Pantry</h3>
        <p>
          Add the ingredients you already have on hand, and The Plateful will craft recipes around
          them — helping you reduce food waste and skip the grocery run. You can add up to 20
          ingredients and get creative meal ideas based on what's in your kitchen.
        </p>

        <h3>Meal Plan</h3>
        <p>
          Choose a nutrition goal — from bulking and cutting to family-friendly or
          Mediterranean — and The Plateful will generate a full 7-day meal plan with breakfast,
          lunch, dinner, and snacks. Each plan includes calorie and macro estimates. You can
          export your plan as a printable PDF or import it into your calendar app.
        </p>

        <h3>Nutrition Data</h3>
        <p>
          All calorie and macronutrient values (protein, carbs, fat) are AI-estimated
          approximations. They are not verified by a dietitian and should not be used for
          medical or clinical purposes.
        </p>
      </>
    ),
  },

  privacy: {
    title: "Privacy Policy",
    content: () => (
      <>
        <p><em>Last updated: May 2026</em></p>

        <h3>Data We Collect</h3>
        <p>
          The Plateful does <strong>not</strong> collect, store, or retain any personal data. We do
          not use cookies, analytics trackers, or advertising pixels. There are no user accounts,
          no sign-ups, and no login required.
        </p>

        <h3>Data Stored on Your Device</h3>
        <p>
          All recipe searches, ingredient lists, and meal plans exist only in your browser's
          memory during your session. When you close or refresh the page, this data is gone. Nothing
          is saved to your device's local storage or sent to our servers for storage.
        </p>

        <h3>Data Sent to Third Parties</h3>
        <p>Your search queries and ingredient inputs are sent to the following services to generate results:</p>
        <ul>
          <li>
            <strong>Cerebras AI</strong> — Your recipe queries are sent to the Cerebras API to
            generate AI-powered recipe suggestions, nutrition estimates, and meal plans. Cerebras
            processes your request and returns a response. We do not send any identifying
            information — only the text of your query.
          </li>
          <li>
            <strong>TheMealDB</strong> — Your search terms are sent to TheMealDB's public API
            to find matching real-world recipes. This is a free, open recipe database. No personal
            data is included in these requests.
          </li>
          <li>
            <strong>Google Fonts</strong> — The app loads typefaces (Playfair Display and DM Sans)
            from Google Fonts. Google may log standard request data (IP address, browser info) as
            described in their privacy policy.
          </li>
        </ul>

        <h3>Rate Limiting</h3>
        <p>
          To prevent abuse, we temporarily track IP addresses in server memory for rate limiting
          purposes (max 10 requests per minute). This data is not logged, stored, or shared, and
          is automatically discarded when the server instance resets.
        </p>

        <h3>Children's Privacy</h3>
        <p>
          The Plateful is not directed at children under 13. We do not knowingly collect any
          information from children.
        </p>

        <h3>Changes to This Policy</h3>
        <p>
          We may update this policy from time to time. Changes will be reflected on this page
          with an updated revision date.
        </p>
      </>
    ),
  },

  terms: {
    title: "Terms of Service",
    content: () => (
      <>
        <p><em>Last updated: May 2026</em></p>

        <p>
          By using The Plateful, you agree to the following terms. If you do not agree, please
          discontinue use of the app.
        </p>

        <h3>1. Nature of the Service</h3>
        <p>
          The Plateful is a free, AI-powered recipe discovery tool. It generates recipe suggestions,
          ingredient lists, cooking instructions, nutrition estimates, and meal plans using
          artificial intelligence. The service is provided "as is" without warranties of any kind.
        </p>

        <h3>2. Not Medical or Nutritional Advice</h3>
        <p>
          All nutrition information (calories, protein, carbs, fat) is AI-estimated and
          approximate. It has not been verified by a registered dietitian or nutritionist.
          Do not rely on The Plateful for medical dietary requirements, allergy management, or
          clinical nutrition planning. Always consult a qualified health professional for
          dietary advice.
        </p>

        <h3>3. Food Safety</h3>
        <p>
          AI-generated recipes may contain errors in ingredients, quantities, or cooking
          instructions. You are responsible for verifying that recipes are safe, that ingredients
          are suitable for your dietary needs and allergies, and that food is prepared and
          cooked properly.
        </p>

        <h3>4. Acceptable Use</h3>
        <p>You agree to use The Plateful only for its intended purpose: discovering recipes and meal
          planning. You may not:</p>
        <ul>
          <li>Submit queries containing violent, explicit, hateful, or illegal content.</li>
          <li>Attempt to bypass content filters or manipulate AI prompts.</li>
          <li>Use automated tools to send excessive requests to the service.</li>
          <li>Reverse-engineer, scrape, or misuse the API.</li>
        </ul>

        <h3>5. Rate Limits</h3>
        <p>
          To ensure fair access for all users, requests are rate-limited. Exceeding these limits
          may result in temporary blocking of your access.
        </p>

        <h3>6. Third-Party Services</h3>
        <p>
          The Plateful relies on third-party services (Cerebras AI, TheMealDB) to generate content.
          We are not responsible for the availability, accuracy, or content produced by these
          services. Web recipes sourced from TheMealDB are attributed to their original authors.
        </p>

        <h3>7. Intellectual Property</h3>
        <p>
          AI-generated recipes are provided for your personal use. Web-sourced recipes from
          TheMealDB remain the property of their respective creators. You may use generated meal
          plans and recipes for personal, non-commercial purposes.
        </p>

        <h3>8. Limitation of Liability</h3>
        <p>
          The Plateful and its creators shall not be held liable for any damages arising from the use
          of this service, including but not limited to: adverse health effects from following
          AI-generated recipes or nutrition advice, food allergies or intolerances not accounted
          for by the AI, or any inaccuracies in recipe instructions or nutritional data.
        </p>

        <h3>9. Changes to These Terms</h3>
        <p>
          We reserve the right to modify these terms at any time. Continued use of The Plateful after
          changes constitutes acceptance of the updated terms.
        </p>
      </>
    ),
  },
};

export default function LegalModal({ page, onClose }) {
  const data = PAGES[page];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!data) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(27,61,47,0.35)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: 20,
          maxWidth: 520, width: "100%", maxHeight: "85vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 48px rgba(27,61,47,0.15)",
          animation: "fadeSlideUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid var(--border-light)",
          flexShrink: 0,
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800,
            color: "var(--text)", margin: 0,
          }}>
            {data.title}
          </h2>
          <button onClick={onClose} style={{
            background: "var(--border-light)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "var(--text-muted)",
            fontFamily: "var(--font-body)", fontWeight: 700, transition: "all 0.15s",
          }}>
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: "20px 24px 28px", overflowY: "auto",
          fontSize: 14, fontFamily: "var(--font-body)", lineHeight: 1.7,
          color: "var(--text)",
        }}>
          <style>{`
            .legal-body h3 {
              font-family: var(--font-display);
              font-size: 16px;
              font-weight: 700;
              margin: 20px 0 8px;
              color: var(--accent);
            }
            .legal-body h3:first-child { margin-top: 0; }
            .legal-body p { margin: 0 0 12px; }
            .legal-body ul { margin: 0 0 12px; padding-left: 20px; }
            .legal-body li { margin-bottom: 6px; }
            .legal-body em { color: var(--text-muted); }
          `}</style>
          <div className="legal-body">
            {data.content()}
          </div>
        </div>
      </div>
    </div>
  );
}
