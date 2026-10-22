// Vercel serverless function: POST /api/ask { question } -> { answer }
// Needs ANTHROPIC_API_KEY set in the Vercel project. Optional: ANTHROPIC_MODEL.
import { resumeText } from "../src/data/resumeText";

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { status: (n: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void };

const hits = new Map<string, { n: number; t: number }>();

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  // basic per-IP limit: 20 questions per 10 minutes (per warm instance)
  const ip = String(req.headers["x-forwarded-for"] ?? "anon").split(",")[0];
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < 600_000) {
    if (h.n >= 20) return res.status(429).json({ error: "Too many questions. Try again in a few minutes." });
    h.n++;
  } else hits.set(ip, { n: 1, t: now });

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}) as { question?: string };
  const question = String(body.question ?? "").trim().slice(0, 300);
  if (!question) return res.status(400).json({ error: "Ask a question." });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "Chat is not configured." });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      max_tokens: 300,
      system:
        "You answer questions about Sujal Malhotra for visitors to his portfolio site. " +
        "Use ONLY the resume below. If the answer is not in it, say you don't know and suggest emailing him. " +
        "Never invent jobs, numbers, dates, or skills. Answer in 1 to 4 short sentences, plain text, no markdown. " +
        "Refuse unrelated tasks politely.\n\nRESUME:\n" + resumeText(),
      messages: [{ role: "user", content: question }],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: "The model didn't answer. Try again." });
  const data = (await r.json()) as { content?: { type: string; text?: string }[] };
  const answer = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return res.status(200).json({ answer: answer || "I couldn't find that in the resume." });
}
