import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders header and three tabs", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Nourishi" })).toBeInTheDocument();
    expect(screen.getByText("Recipe Search")).toBeInTheDocument();
    expect(screen.getByText("Pantry")).toBeInTheDocument();
    expect(screen.getByText("Meal Plan")).toBeInTheDocument();
  });

  it("defaults to search tab with input visible", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Spicy chicken/i)).toBeInTheDocument();
  });

  it("switches to pantry tab", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Pantry"));
    expect(screen.getByPlaceholderText(/Add an ingredient/i)).toBeInTheDocument();
  });

  it("switches to meal plan tab", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Meal Plan"));
    expect(screen.getByText("Bulk & Build")).toBeInTheDocument();
    expect(screen.getByText("Lean & Cut")).toBeInTheDocument();
  });

  it("blocks inappropriate search query and shows error", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByPlaceholderText(/Spicy chicken/i);
    await user.type(input, "murder");
    await user.click(screen.getByText("Go"));
    expect(screen.getByText("Please search for food-related terms.")).toBeInTheDocument();
  });

  it("blocks inappropriate ingredient and shows error", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Pantry"));
    const input = screen.getByPlaceholderText(/Add an ingredient/i);
    await user.type(input, "cocaine");
    await user.click(screen.getByText("+"));
    expect(screen.getByText("Please search for food-related terms.")).toBeInTheDocument();
  });

  it("does not submit empty search", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Go"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("adds and displays ingredients", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Pantry"));
    const input = screen.getByPlaceholderText(/Add an ingredient/i);
    await user.type(input, "chicken");
    await user.click(screen.getByText("+"));
    expect(screen.getByText("chicken")).toBeInTheDocument();
  });

  it("does not add duplicate ingredients", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Pantry"));
    const input = screen.getByPlaceholderText(/Add an ingredient/i);

    await user.type(input, "chicken");
    await user.click(screen.getByText("+"));
    await user.type(input, "chicken");
    await user.click(screen.getByText("+"));

    // Should only appear once as an ingredient tag
    const tags = screen.getAllByText("chicken");
    expect(tags.length).toBe(1);
  });

  it("shows footer with legal links", () => {
    render(<App />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("opens legal modal when footer link clicked", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("About"));
    expect(screen.getByText("About Nourishi")).toBeInTheDocument();
  });
});
