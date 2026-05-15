// @vitest-environment node
import { describe, it, expect } from "vitest";
import { checkContent } from "./contentFilter";

describe("checkContent", () => {
  it("passes valid food terms", () => {
    expect(checkContent("chicken pasta").blocked).toBe(false);
    expect(checkContent("spicy ramen").blocked).toBe(false);
    expect(checkContent("chocolate cake").blocked).toBe(false);
    expect(checkContent("grilled salmon with lemon").blocked).toBe(false);
  });

  it("passes common food terms that share substrings with blocked words", () => {
    expect(checkContent("cocktail").blocked).toBe(false);
    expect(checkContent("shellfish").blocked).toBe(false);
    expect(checkContent("pork chops").blocked).toBe(false);
    expect(checkContent("sausage").blocked).toBe(false);
    expect(checkContent("grasshopper pie").blocked).toBe(false);
    expect(checkContent("spicy ramen").blocked).toBe(false);
    expect(checkContent("grape juice").blocked).toBe(false);
    expect(checkContent("skillet chicken").blocked).toBe(false);
    expect(checkContent("herb roasted").blocked).toBe(false);
  });

  it("blocks violence terms", () => {
    expect(checkContent("murder").blocked).toBe(true);
    expect(checkContent("torture").blocked).toBe(true);
    expect(checkContent("massacre").blocked).toBe(true);
    expect(checkContent("bomb").blocked).toBe(true);
  });

  it("blocks explicit/sexual terms", () => {
    expect(checkContent("porn").blocked).toBe(true);
    expect(checkContent("hentai").blocked).toBe(true);
    expect(checkContent("xxx").blocked).toBe(true);
    expect(checkContent("erotic").blocked).toBe(true);
  });

  it("blocks drug terms", () => {
    expect(checkContent("cocaine").blocked).toBe(true);
    expect(checkContent("heroin").blocked).toBe(true);
    expect(checkContent("fentanyl").blocked).toBe(true);
    expect(checkContent("meth lab").blocked).toBe(true);
  });

  it("blocks hate speech / slurs", () => {
    expect(checkContent("nazi").blocked).toBe(true);
    expect(checkContent("white supremacy").blocked).toBe(true);
    expect(checkContent("heil hitler").blocked).toBe(true);
  });

  it("blocks misc harmful content", () => {
    expect(checkContent("how to poison").blocked).toBe(true);
    expect(checkContent("child abuse").blocked).toBe(true);
    expect(checkContent("rape").blocked).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(checkContent("MURDER").blocked).toBe(true);
    expect(checkContent("MuRdEr").blocked).toBe(true);
    expect(checkContent("COCAINE").blocked).toBe(true);
  });

  it("matches stems (pedophil catches pedophilia)", () => {
    expect(checkContent("pedophilia").blocked).toBe(true);
    expect(checkContent("terrorists").blocked).toBe(true);
    expect(checkContent("decapitated").blocked).toBe(true);
    expect(checkContent("mutilation").blocked).toBe(true);
  });

  it("blocks terms embedded in longer text", () => {
    expect(checkContent("I want murder recipes").blocked).toBe(true);
    expect(checkContent("recipes with cocaine").blocked).toBe(true);
  });

  it("returns { blocked: false } for non-string input", () => {
    expect(checkContent(null).blocked).toBe(false);
    expect(checkContent(undefined).blocked).toBe(false);
    expect(checkContent(42).blocked).toBe(false);
    expect(checkContent({}).blocked).toBe(false);
  });

  it("returns { blocked: false } for empty string", () => {
    expect(checkContent("").blocked).toBe(false);
  });

  it("includes a reason message when blocked", () => {
    const result = checkContent("murder");
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe("Please search for food-related terms.");
  });
});
