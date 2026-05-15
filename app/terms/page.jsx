import LegalPageLayout from "../../src/components/LegalPageLayout";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for The Plateful — rules for using the app.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p><em>Last updated: May 2026</em></p>

      <p>
        By using The Plateful, you agree to the following terms. If you do not agree, please
        discontinue use of the app.
      </p>

      <h3>1. Nature of the Service</h3>
      <p>
        The Plateful is a free, AI-powered recipe discovery tool. It generates recipe suggestions,
        ingredient lists, cooking instructions, nutrition estimates, and meal plans using
        artificial intelligence. The service is provided &quot;as is&quot; without warranties of any kind.
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

      <h3>8. Advertising</h3>
      <p>
        The Plateful displays advertisements served by Google AdSense. These ads may be
        personalized based on your browsing activity using cookies set by Google. By using
        this service, you acknowledge that third-party advertising is part of the experience.
        You may opt out of personalized ads via your Google Ads Settings.
      </p>

      <h3>9. Limitation of Liability</h3>
      <p>
        The Plateful and its creators shall not be held liable for any damages arising from the use
        of this service, including but not limited to: adverse health effects from following
        AI-generated recipes or nutrition advice, food allergies or intolerances not accounted
        for by the AI, or any inaccuracies in recipe instructions or nutritional data.
      </p>

      <h3>10. Changes to These Terms</h3>
      <p>
        We reserve the right to modify these terms at any time. Continued use of The Plateful after
        changes constitutes acceptance of the updated terms.
      </p>
    </LegalPageLayout>
  );
}
