// Simple in-memory rate limiter (per Vercel instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per IP per minute
const MAX_PROMPT_LENGTH = 5000;

// Models to try in order on Cerebras (free tier: 30 RPM, 1M tokens/day)
const MODEL_CHAIN = [
  "llama3.1-8b",
  "qwen-3-235b-a22b-instruct-2507",
];

// Only allow requests from our own origin(s)
const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

async function callLLM(apiKey, model, systemPrompt, userPrompt) {
  const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text().catch(() => "");
    console.error(`${model} error ${status}:`, errText.slice(0, 200));
    return { ok: false, status, retryable: status === 429 || status === 503 };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  if (!text.trim()) {
    console.error(`${model}: empty response`);
    return { ok: false, status: 0, retryable: false };
  }

  return { ok: true, text };
}

export default async function handler(req, res) {
  // CORS handling
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.length > 0 && origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const { systemPrompt, userPrompt } = req.body;

  // Type validation
  if (typeof systemPrompt !== "string" || typeof userPrompt !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Length validation
  if (!systemPrompt.trim() || !userPrompt.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (systemPrompt.length > MAX_PROMPT_LENGTH || userPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Request too large" });
  }

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Service temporarily unavailable" });
  }

  // Try each model in the chain, falling back on rate limit or error
  let lastError = null;
  for (const model of MODEL_CHAIN) {
    const result = await callLLM(apiKey, model, systemPrompt, userPrompt);

    if (result.ok) {
      return res.status(200).json({ text: result.text });
    }

    lastError = result.error;

    // If not retryable (e.g. bad request), stop trying
    if (!result.retryable) break;

    console.log(`${model} rate limited (${result.status}), trying next model...`);
  }

  return res.status(502).json({
    error: lastError || "All AI models are busy. Please try again in a moment.",
  });
}
