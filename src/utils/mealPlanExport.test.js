import { describe, it, expect } from "vitest";
import { escapeHTML, escapeICS } from "./mealPlanExport";

describe("escapeHTML", () => {
  it("escapes & < > \" '", () => {
    expect(escapeHTML("&")).toBe("&amp;");
    expect(escapeHTML("<")).toBe("&lt;");
    expect(escapeHTML(">")).toBe("&gt;");
    expect(escapeHTML('"')).toBe("&quot;");
    expect(escapeHTML("'")).toBe("&#39;");
  });

  it("escapes a full XSS payload", () => {
    const input = '<script>alert("xss")</script>';
    const result = escapeHTML(input);
    expect(result).not.toContain("<script>");
    expect(result).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("escapes img onerror payload", () => {
    const input = '<img onerror=alert(1) src=x>';
    const result = escapeHTML(input);
    expect(result).not.toContain("<img");
    expect(result).toContain("&lt;img");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHTML("Chicken Pasta")).toBe("Chicken Pasta");
    expect(escapeHTML("500 cal")).toBe("500 cal");
  });

  it("handles null and undefined", () => {
    expect(escapeHTML(null)).toBe("");
    expect(escapeHTML(undefined)).toBe("");
  });

  it("handles numbers", () => {
    expect(escapeHTML(500)).toBe("500");
    expect(escapeHTML(0)).toBe("0");
  });
});

describe("escapeICS", () => {
  it("escapes backslashes", () => {
    expect(escapeICS("path\\file")).toBe("path\\\\file");
  });

  it("escapes semicolons", () => {
    expect(escapeICS("a;b")).toBe("a\\;b");
  });

  it("escapes commas", () => {
    expect(escapeICS("a,b")).toBe("a\\,b");
  });

  it("escapes newlines", () => {
    expect(escapeICS("line1\nline2")).toBe("line1\\nline2");
  });

  it("escapes multiple special chars together", () => {
    expect(escapeICS("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeICS("Breakfast: Oatmeal")).toBe("Breakfast: Oatmeal");
  });
});
