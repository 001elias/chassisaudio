import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Use POST (got ${req.method})` });
  }
  try {
    const { pathname, password } = (await readBody(req)) || {};
    if (password !== process.env.UPLOAD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized (wrong password)" });
    }
    if (typeof pathname !== "string" || !pathname.startsWith("audio/")) {
      return res.status(400).json({ error: "Bad pathname" });
    }
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: ["audio/*"],
      maximumSizeInBytes: 200 * 1024 * 1024,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    res.status(200).json({ clientToken });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
