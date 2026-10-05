import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: "audio/" });
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(blobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
