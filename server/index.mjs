import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { fallbackAnswer, planActions, profile, retrieveContext } from "./portfolio-data.mjs";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

function sendEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function chunkText(text) {
  const chunks = text.match(/.{1,22}(\s|$)/g) || [text];
  return chunks.map((chunk) => chunk.trimStart());
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    owner: profile.name,
    openai: Boolean(openai)
  });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").slice(0, 2000);
  const context = retrieveContext(message);
  const actions = planActions(message);

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  for (const action of actions) {
    sendEvent(res, { type: "action", value: action });
  }

  try {
    if (openai) {
      const system = [
        "You are the AI portfolio assistant for Nikhil Shukla.",
        "Answer using only the provided portfolio context unless asked for general explanation.",
        "Always answer in simple, clear English.",
        "Use short sentences because your answer may be spoken aloud by a voice assistant.",
        "Be crisp, confident, recruiter-friendly, and specific.",
        "Never invent private links or credentials.",
        "If the visitor asks for actions, mention that the interface is already moving/highlighting relevant sections."
      ].join(" ");

      const contextText = context.map((item) => `## ${item.title}\n${item.text}`).join("\n\n");
      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        stream: true,
        temperature: 0.55,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Portfolio context:\n${contextText || "No matching local context."}\n\nVisitor question:\n${message}`
          }
        ]
      });

      for await (const part of stream) {
        const token = part.choices[0]?.delta?.content;
        if (token) {
          sendEvent(res, { type: "token", value: token });
        }
      }
    } else {
      const answer = fallbackAnswer(message, context);
      for (const token of chunkText(answer)) {
        sendEvent(res, { type: "token", value: token });
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
    }

    sendEvent(res, { type: "done" });
  } catch (error) {
    const fallback = fallbackAnswer(message, context);
    sendEvent(res, {
      type: "token",
      value: fallback
    });
    sendEvent(res, {
      type: "error",
      value: " Assistant switched to local knowledge because the AI provider did not respond."
    });
  } finally {
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Nikhil portfolio agent listening on http://localhost:${port}`);
});
