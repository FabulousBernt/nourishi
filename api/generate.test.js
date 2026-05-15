// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler, { sanitizeInput, isBlockedContent, transformMealDBRecipe } from "./generate.js";

// --- Helpers to build mock req/res ---

function mockReq(overrides = {}) {
  return {
    method: "POST",
    headers: {},
    body: {
      systemPrompt: "You are a chef.",
      userPrompt: "Find pasta recipes",
    },
    ...overrides,
  };
}

function mockRes() {
  const res = {
    _status: null,
    _json: null,
    _headers: {},
    _ended: false,
    status(code) { res._status = code; return res; },
    json(data) { res._json = data; return res; },
    end() { res._ended = true; return res; },
    setHeader(key, val) { res._headers[key] = val; },
  };
  return res;
}

// --- Mock fetch globally ---
const originalFetch = globalThis.fetch;
let fetchMock;

beforeEach(() => {
  // Clear rate limit map between tests
  vi.useFakeTimers();
  // Reset env
  delete process.env.ALLOWED_ORIGIN;
  process.env.CEREBRAS_API_KEY = "test-key";

  fetchMock = vi.fn();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.fetch = originalFetch;
  delete process.env.CEREBRAS_API_KEY;
});

// Helper: set up fetch to return successful AI + empty MealDB
function mockSuccessfulFetch() {
  fetchMock.mockImplementation((url) => {
    if (url.includes("cerebras.ai")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '[{"name":"Pasta","description":"Tasty","cuisine":"Italian","time":"30 min","servings":"4","calories":500,"protein":20,"carbs":60,"fat":15,"isApprox":true,"difficulty":"Easy","ingredients":["pasta"],"instructions":["Cook"]}]' } }],
        }),
      });
    }
    if (url.includes("themealdb.com")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ meals: null }),
      });
    }
    return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("") });
  });
}

// ---- Unit tests for exported helpers ----

describe("sanitizeInput", () => {
  it("strips control characters and null bytes", () => {
    expect(sanitizeInput("hello\x00world")).toBe("helloworld");
    expect(sanitizeInput("test\x07data")).toBe("testdata");
    expect(sanitizeInput("a\x0Bb")).toBe("ab");
  });

  it("preserves newlines and tabs", () => {
    expect(sanitizeInput("line1\nline2")).toBe("line1\nline2");
    expect(sanitizeInput("col1\tcol2")).toBe("col1\tcol2");
  });

  it("truncates to maxLen", () => {
    expect(sanitizeInput("a".repeat(600), 200)).toBe("a".repeat(200));
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(42)).toBe("");
    expect(sanitizeInput(undefined)).toBe("");
  });
});

describe("isBlockedContent", () => {
  it("blocks known bad terms", () => {
    expect(isBlockedContent("murder")).toBe(true);
    expect(isBlockedContent("cocaine")).toBe(true);
    expect(isBlockedContent("porn")).toBe(true);
  });

  it("passes food terms", () => {
    expect(isBlockedContent("chicken pasta")).toBe(false);
    expect(isBlockedContent("spicy ramen")).toBe(false);
  });

  it("returns false for non-string", () => {
    expect(isBlockedContent(null)).toBe(false);
    expect(isBlockedContent(42)).toBe(false);
  });
});

describe("transformMealDBRecipe", () => {
  it("extracts ingredients with measures", () => {
    const meal = {
      strMeal: "Test Meal",
      strInstructions: "Step one. Step two.",
      strArea: "British",
      strIngredient1: "Chicken",
      strMeasure1: "500g",
      strIngredient2: "Salt",
      strMeasure2: "1 tsp",
      strIngredient3: "",
      strMeasure3: "",
      strSource: "https://example.com",
      strMealThumb: "https://example.com/img.jpg",
    };
    // Fill remaining ingredient slots with empty/null
    for (let i = 4; i <= 20; i++) {
      meal[`strIngredient${i}`] = null;
      meal[`strMeasure${i}`] = null;
    }

    const result = transformMealDBRecipe(meal);
    expect(result.name).toBe("Test Meal");
    expect(result.cuisine).toBe("British");
    expect(result.ingredients).toEqual(["500g Chicken", "1 tsp Salt"]);
    expect(result.source).toBe("TheMealDB");
    expect(result.sourceUrl).toBe("https://example.com");
    expect(result.thumbnail).toBe("https://example.com/img.jpg");
    expect(result.servings).toBe("4");
  });

  it("handles ingredient without measure", () => {
    const meal = { strMeal: "Simple", strInstructions: "Do it.", strArea: null };
    for (let i = 1; i <= 20; i++) {
      meal[`strIngredient${i}`] = i === 1 ? "Butter" : null;
      meal[`strMeasure${i}`] = null;
    }
    const result = transformMealDBRecipe(meal);
    expect(result.ingredients).toEqual(["Butter"]);
  });
});

// ---- Handler integration tests ----

describe("handler", () => {
  describe("method enforcement", () => {
    it("returns 405 for GET", async () => {
      const req = mockReq({ method: "GET" });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(405);
      expect(res._json.error).toBe("Method not allowed");
    });

    it("returns 204 for OPTIONS", async () => {
      const req = mockReq({ method: "OPTIONS" });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(204);
      expect(res._ended).toBe(true);
    });
  });

  describe("CORS", () => {
    it("rejects cross-origin when ALLOWED_ORIGIN not set", async () => {
      const req = mockReq({ headers: { origin: "https://evil.com" } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(403);
    });

    it("rejects wrong origin when ALLOWED_ORIGIN is set", async () => {
      process.env.ALLOWED_ORIGIN = "https://nourishi.vercel.app";
      // Re-import to pick up env change — but since ALLOWED_ORIGINS is built at module load,
      // we test the handler's behavior with headers directly
      const req = mockReq({ headers: { origin: "https://evil.com" } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(403);
    });

    it("allows same-origin requests (no origin header)", async () => {
      mockSuccessfulFetch();
      const req = mockReq({ headers: {} });
      const res = mockRes();
      await handler(req, res);
      // Should not be 403 — proceeds to process request
      expect(res._status).not.toBe(403);
    });
  });

  describe("input validation", () => {
    it("returns 400 for missing systemPrompt", async () => {
      const req = mockReq({ body: { userPrompt: "test" } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._json.error).toBe("Invalid request");
    });

    it("returns 400 for non-string prompts", async () => {
      const req = mockReq({ body: { systemPrompt: 123, userPrompt: "test" } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
    });

    it("returns 400 for empty prompts", async () => {
      const req = mockReq({ body: { systemPrompt: "   ", userPrompt: "test" } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._json.error).toBe("Missing required fields");
    });

    it("returns 400 for prompts exceeding max length", async () => {
      const req = mockReq({
        body: { systemPrompt: "a".repeat(5001), userPrompt: "test" },
      });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._json.error).toBe("Request too large");
    });

    it("returns 413 for oversized body", async () => {
      const req = mockReq({
        body: { systemPrompt: "x".repeat(10000), userPrompt: "y".repeat(10000), extra: "z".repeat(5000) },
      });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(413);
    });
  });

  describe("content moderation", () => {
    it("returns 400 for blocked content in userPrompt", async () => {
      const req = mockReq({
        body: { systemPrompt: "You are a chef.", userPrompt: "murder recipes" },
      });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
      expect(res._json.error).toBe("Please search for food-related terms.");
    });

    it("returns 400 for blocked content in searchQuery", async () => {
      const req = mockReq({
        body: { systemPrompt: "You are a chef.", userPrompt: "Find recipes", searchQuery: "cocaine" },
      });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
    });

    it("returns 400 for blocked content in searchIngredient", async () => {
      const req = mockReq({
        body: { systemPrompt: "You are a chef.", userPrompt: "Find recipes", searchIngredient: "porn" },
      });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(400);
    });
  });

  describe("rate limiting", () => {
    it("returns 429 after exceeding rate limit", async () => {
      mockSuccessfulFetch();
      const ip = "192.168.1.100";

      for (let i = 0; i < 10; i++) {
        const req = mockReq({ headers: { "x-forwarded-for": ip } });
        const res = mockRes();
        await handler(req, res);
      }

      // 11th request should be rate limited
      const req = mockReq({ headers: { "x-forwarded-for": ip } });
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(429);
    });
  });

  describe("missing API key", () => {
    it("returns 500 when CEREBRAS_API_KEY is missing", async () => {
      delete process.env.CEREBRAS_API_KEY;
      const req = mockReq();
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(500);
      expect(res._json.error).toBe("Service temporarily unavailable");
    });
  });

  describe("security headers", () => {
    it("sets security headers on every response", async () => {
      const req = mockReq({ method: "GET" });
      const res = mockRes();
      await handler(req, res);
      expect(res._headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(res._headers["X-Frame-Options"]).toBe("DENY");
      expect(res._headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
      expect(res._headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("happy path", () => {
    it("returns merged recipes on valid request", async () => {
      mockSuccessfulFetch();
      const req = mockReq();
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      expect(res._json.recipes).toBeDefined();
      expect(res._json.recipes.length).toBeGreaterThan(0);
      expect(res._json.recipes[0].source).toBe("AI Generated");
    });

    it("falls back to next model on 429", async () => {
      vi.advanceTimersByTime(61000); // reset rate limit window
      let callCount = 0;
      fetchMock.mockImplementation((url) => {
        if (url.includes("cerebras.ai")) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ ok: false, status: 429, text: () => Promise.resolve("rate limited") });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              choices: [{ message: { content: '[{"name":"Fallback Pasta","description":"Good","cuisine":"Italian","time":"20 min","servings":"2","calories":400,"protein":15,"carbs":50,"fat":10,"isApprox":true,"difficulty":"Easy","ingredients":["pasta"],"instructions":["Cook"]}]' } }],
            }),
          });
        }
        if (url.includes("themealdb.com")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ meals: null }) });
        }
        return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("") });
      });

      const req = mockReq();
      const res = mockRes();
      await handler(req, res);
      expect(res._status).toBe(200);
      // Should have called Cerebras twice (first model 429, second succeeds)
      const cerebrasCalls = fetchMock.mock.calls.filter(c => c[0].includes("cerebras.ai"));
      expect(cerebrasCalls.length).toBe(2);
    });
  });
});
