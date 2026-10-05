import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { urls, password } = req.body || {};
  if (password !== process.env.UPLOAD_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!Array.isArray(urls) || !urls.every((u) => typeof u === "string")) {
    return res.status(400).json({ error: "Bad request" });
  }
  try {
    if (urls.length) await del(urls);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
