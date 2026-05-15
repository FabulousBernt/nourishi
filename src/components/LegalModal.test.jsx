import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LegalModal from "./LegalModal";

describe("LegalModal", () => {
  it("renders About page with correct title", () => {
    render(<LegalModal page="about" onClose={() => {}} />);
    expect(screen.getByText("About The Plateful")).toBeInTheDocument();
  });

  it("renders Privacy Policy page", () => {
    render(<LegalModal page="privacy" onClose={() => {}} />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders Terms of Service page", () => {
    render(<LegalModal page="terms" onClose={() => {}} />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("returns null for invalid page", () => {
    const { container } = render(<LegalModal page="invalid" onClose={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(<LegalModal page="about" onClose={onClose} />);
    const closeBtn = screen.getByText("×");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<LegalModal page="about" onClose={onClose} />);
    // The backdrop is the outermost fixed-position overlay div
    const backdrop = container.firstChild;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT call onClose when modal content clicked", () => {
    const onClose = vi.fn();
    render(<LegalModal page="about" onClose={onClose} />);
    const title = screen.getByText("About The Plateful");
    fireEvent.click(title);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<LegalModal page="about" onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sets body overflow hidden on mount and restores on unmount", () => {
    const { unmount } = render(<LegalModal page="about" onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
