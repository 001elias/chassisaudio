import { handleUpload } from "@vercel/blob/client";

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
  try {
    const body = await readBody(req);
    if (!body) {
      return res.status(400).json({
        error: `Empty body (method ${req.method}, content-type ${req.headers["content-type"]})`,
      });
    }
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (clientPayload !== process.env.UPLOAD_PASSWORD) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: ["audio/*"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    res.status(200).json(json);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
