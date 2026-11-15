// Vercel serverless function: API anahtarı sadece burada, sunucuda kalır.
// Vercel > Settings > Environment Variables bölümüne şunları ekle:
//   RETELL_API_KEY  -> Retell panelindeki API key
//   RETELL_AGENT_ID -> Asistanının agent_id değeri
//   DEMO_CODE       -> Denemeyi yapacak kişilere vereceğin giriş kodu

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Yöntem desteklenmiyor" });
  }

  const { code } = req.body || {};

  if (!process.env.DEMO_CODE || code !== process.env.DEMO_CODE) {
    return res.status(401).json({ error: "Giriş kodu hatalı" });
  }

  try {
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: process.env.RETELL_AGENT_ID }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Retell hatası:", response.status, detail);
      return res.status(502).json({ error: "Arama başlatılamadı" });
    }

    const data = await response.json();
    return res.status(200).json({ accessToken: data.access_token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
};
