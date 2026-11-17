export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { prompt } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
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
    if (!response.ok) return res.status(response.status).json({ google_error: data });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
