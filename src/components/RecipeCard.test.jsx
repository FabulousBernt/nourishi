import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeCard from "./RecipeCard";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

const baseRecipe = {
  name: "Spaghetti Carbonara",
  description: "Classic Italian pasta dish.",
  cuisine: "Italian",
  time: "30 min",
  servings: "4",
  difficulty: "Medium",
  calories: 550,
  protein: 25,
  carbs: 60,
  fat: 20,
  isApprox: true,
  ingredients: ["400g spaghetti", "200g pancetta", "4 eggs"],
  instructions: ["Boil pasta", "Cook pancetta", "Mix together"],
  source: "AI Generated",
  sourceUrl: null,
  thumbnail: null,
};

describe("RecipeCard", () => {
  it("renders name, description, and cuisine", () => {
    render(<RecipeCard recipe={baseRecipe} index={0} />);
    expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
    expect(screen.getByText("Classic Italian pasta dish.")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
  });

  it("does not render thumbnail when null", () => {
    render(<RecipeCard recipe={baseRecipe} index={0} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders thumbnail for valid https URL", () => {
    const recipe = { ...baseRecipe, thumbnail: "https://example.com/img.jpg" };
    render(<RecipeCard recipe={recipe} index={0} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });

  it("does not render thumbnail for javascript: URL", () => {
    const recipe = { ...baseRecipe, thumbnail: "javascript:alert(1)" };
    render(<RecipeCard recipe={recipe} index={0} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render thumbnail for data: URL", () => {
    const recipe = { ...baseRecipe, thumbnail: "data:text/html,<script>alert(1)</script>" };
    render(<RecipeCard recipe={recipe} index={0} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("toggles ingredients and instructions on click", async () => {
    const user = userEvent.setup();
    render(<RecipeCard recipe={baseRecipe} index={0} />);

    // Initially collapsed — ingredients not visible
    expect(screen.queryByText("Ingredients")).not.toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText("Spaghetti Carbonara"));
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
    expect(screen.getByText("400g spaghetti")).toBeInTheDocument();
    expect(screen.getByText("Instructions")).toBeInTheDocument();

    // Click to collapse
    await user.click(screen.getByText("Spaghetti Carbonara"));
    expect(screen.queryByText("Ingredients")).not.toBeInTheDocument();
  });

  it("does not render source link for javascript: URL", () => {
    const recipe = { ...baseRecipe, sourceUrl: "javascript:alert(1)" };
    render(<RecipeCard recipe={recipe} index={0} />);
    expect(screen.queryByText(/View Original/)).not.toBeInTheDocument();
  });

  it("renders source link with security attributes for valid URL", () => {
    const recipe = { ...baseRecipe, sourceUrl: "https://example.com/recipe" };
    render(<RecipeCard recipe={recipe} index={0} />);
    const link = screen.getByRole("link", { name: /View Original/ });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("href", "https://example.com/recipe");
  });

  it("shows View Full Recipe button on collapsed card when slug is provided", () => {
    render(<RecipeCard recipe={baseRecipe} index={0} slug="spaghetti-carbonara-abc123" />);
    const link = screen.getByRole("link", { name: /View Full Recipe/ });
    expect(link).toHaveAttribute("href", "/recipe/spaghetti-carbonara-abc123");
  });

  it("shows AI badge for AI-generated recipes", () => {
    render(<RecipeCard recipe={baseRecipe} index={0} />);
    expect(screen.getByText(/AI/)).toBeInTheDocument();
  });

  it("shows Web badge for TheMealDB recipes", () => {
    const recipe = { ...baseRecipe, source: "TheMealDB" };
    render(<RecipeCard recipe={recipe} index={0} />);
    expect(screen.getByText(/Web/)).toBeInTheDocument();
  });
});
