export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  const { prompt } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
        return res.status(200).json({ text, attempt });
      }
      lastError = data;
      if (response.status === 503 || response.status === 429) {
        await sleep(1200);
        continue;
      }
      break;
    } catch (e) {
      lastError = String(e);
    }
  }

  return res.status(503).json({ google_error: lastError });
}
