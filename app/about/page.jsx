import LegalPageLayout from "../../src/components/LegalPageLayout";

export const metadata = {
  title: "About",
  description: "Learn about The Plateful — an AI-powered recipe discovery and meal planning app.",
};

export default function AboutPage() {
  return (
    <LegalPageLayout title="About The Plateful">
      <p>
        The Plateful is an AI-powered recipe discovery app designed to make cooking more
        accessible, creative, and fun. Here&apos;s what each section does:
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
        ingredients and get creative meal ideas based on what&apos;s in your kitchen.
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
    </LegalPageLayout>
  );
}
