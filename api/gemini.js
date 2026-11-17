export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  const { prompt } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ["gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

  let lastError = null;
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt || "Привет! Скажи одно короткое слово." }] }],
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({ text, model });
      }
      lastError = data;
    } catch (e) {
      lastError = String(e);
    }
  }
  return res.status(503).json({ google_error: lastError });
}
