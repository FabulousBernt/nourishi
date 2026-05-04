export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { systemPrompt, userPrompt, useWebSearch } = req.body;

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: "Missing systemPrompt or userPrompt" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: missing API key" });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { maxOutputTokens: 8192, temperature: 1.0 },
  };

  if (useWebSearch) {
    body.tools = [{ google_search: {} }];
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Gemini API error ${response.status}`,
      });
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      ?.map((p) => p.text)
      .join("") || "";

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
}
