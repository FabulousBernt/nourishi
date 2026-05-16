import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("../../../../src/lib/api-helpers.js", () => ({
  checkRateLimit: vi.fn(() => true),
}));

const mockSql = vi.fn();
vi.mock("../../../../src/lib/db.js", () => ({
  getDb: () => mockSql,
}));

vi.mock("../../../../src/lib/recipe-helpers.js", () => ({
  normalizeName: vi.fn((name) => name.toLowerCase()),
  hashIngredients: vi.fn(() => "abc12345"),
}));

vi.mock("../../../../src/lib/slugify.js", () => ({
  makeRecipeSlug: vi.fn(() => "test-recipe-slug"),
}));

import { POST } from "./route.js";
import { checkRateLimit } from "../../../../src/lib/api-helpers.js";

function makeRequest(body) {
  return new Request("http://localhost/api/recipes/rate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  slug: "spaghetti-carbonara",
  stars: 5,
  recipe: {
    name: "Spaghetti Carbonara",
    cuisine: "Italian",
    ingredients: ["pasta", "eggs"],
    instructions: ["Cook"],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockReturnValue(true);
  // Default: recipe not in DB, insert succeeds
  mockSql.mockResolvedValue([]);
});

describe("POST /api/recipes/rate", () => {
  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockReturnValue(false);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/recipes/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 for missing slug", async () => {
    const res = await POST(makeRequest({ ...validBody, slug: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid star rating", async () => {
    const res = await POST(makeRequest({ ...validBody, stars: 6 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for stars = 0", async () => {
    const res = await POST(makeRequest({ ...validBody, stars: 0 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing recipe data", async () => {
    const res = await POST(makeRequest({ slug: "test", stars: 3 }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with averageRating and ratingCount on success", async () => {
    // Mock: upsert rating
    mockSql.mockResolvedValueOnce([]);
    // Mock: calculate average (SELECT)
    mockSql.mockResolvedValueOnce([{ total: 5, count: 1 }]);
    // Mock: check existing recipe
    mockSql.mockResolvedValueOnce([]);
    // Mock: check duplicate
    mockSql.mockResolvedValueOnce([]);
    // Mock: insert recipe
    mockSql.mockResolvedValueOnce([]);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.averageRating).toBe(5);
    expect(data.ratingCount).toBe(1);
    expect(data.saved).toBe(true);
  });

  it("updates existing recipe ratings without creating new entry", async () => {
    // Mock: upsert rating
    mockSql.mockResolvedValueOnce([]);
    // Mock: calculate average
    mockSql.mockResolvedValueOnce([{ total: 12, count: 3 }]);
    // Mock: recipe exists
    mockSql.mockResolvedValueOnce([{ id: 1 }]);
    // Mock: update rating
    mockSql.mockResolvedValueOnce([]);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.averageRating).toBe(4);
    expect(data.ratingCount).toBe(3);
  });

  it("has security headers", async () => {
    mockSql.mockResolvedValueOnce([]);
    mockSql.mockResolvedValueOnce([{ total: 5, count: 1 }]);
    mockSql.mockResolvedValueOnce([]);
    mockSql.mockResolvedValueOnce([]);
    mockSql.mockResolvedValueOnce([]);

    const res = await POST(makeRequest(validBody));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });
});
