import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "./StarRating";

const mockRecipe = {
  name: "Test Recipe",
  cuisine: "Italian",
  ingredients: ["pasta", "sauce"],
  instructions: ["Cook pasta", "Add sauce"],
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("StarRating", () => {
  it("renders 5 stars", () => {
    render(<StarRating slug="test" recipe={mockRecipe} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("shows average rating and count when provided", () => {
    render(<StarRating slug="test" recipe={mockRecipe} initialRating={4.2} initialCount={7} />);
    expect(screen.getByText("4.2 (7)")).toBeInTheDocument();
  });

  it("does not show count when zero", () => {
    render(<StarRating slug="test" recipe={mockRecipe} initialRating={0} initialCount={0} />);
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });

  it("loads previous user rating from localStorage", () => {
    localStorage.setItem("plateful_ratings", JSON.stringify({ test: 3 }));
    render(<StarRating slug="test" recipe={mockRecipe} />);
    // The 3rd star should be highlighted (gold color)
    const stars = screen.getAllByRole("button");
    expect(stars[2]).toHaveStyle({ color: "#F5A623" });
    expect(stars[3]).not.toHaveStyle({ color: "#F5A623" });
  });

  it("submits rating on click and saves to localStorage", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ averageRating: 4.5, ratingCount: 3, saved: false }),
    });

    render(<StarRating slug="test-recipe" recipe={mockRecipe} />);
    const stars = screen.getAllByRole("button");
    await user.click(stars[3]); // Click 4th star

    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem("plateful_ratings"));
    expect(stored["test-recipe"]).toBe(4);

    // Check fetch was called
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/recipes/rate", expect.objectContaining({
      method: "POST",
    }));
  });

  it("shows Saved! when API returns saved=true", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ averageRating: 4.0, ratingCount: 1, saved: true }),
    });

    render(<StarRating slug="test" recipe={mockRecipe} />);
    await user.click(screen.getAllByRole("button")[4]); // 5 stars

    expect(await screen.findByText("Saved!")).toBeInTheDocument();
  });

  it("does not re-submit the same rating", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ averageRating: 3.0, ratingCount: 1, saved: false }),
    });

    render(<StarRating slug="test" recipe={mockRecipe} />);
    const stars = screen.getAllByRole("button");
    await user.click(stars[2]); // Rate 3 stars
    await user.click(stars[2]); // Click same star again

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
