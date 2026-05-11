import OpenAI from "openai";
import { agentProfile, fallbackAnswer, planActions, retrieveContext } from "@/lib/portfolio-agent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, payload: unknown) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
}

function chunkText(text: string) {
  const chunks = text.match(/.{1,22}(\s|$)/g) || [text];
  return chunks.map((chunk) => chunk.trimStart());
}

export function GET() {
  return Response.json({
    ok: true,
    owner: agentProfile.name,
    openai: Boolean(process.env.OPENAI_API_KEY)
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message || "").slice(0, 2000);
  const context = retrieveContext(message);
  const actions = planActions(message);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const action of actions) {
        sendEvent(controller, { type: "action", value: action });
      }

      try {
        if (process.env.OPENAI_API_KEY) {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
          const completion = await openai.chat.completions.create({
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

          for await (const part of completion) {
            const token = part.choices[0]?.delta?.content;
            if (token) {
              sendEvent(controller, { type: "token", value: token });
            }
          }
        } else {
          const answer = fallbackAnswer(message, context);
          for (const token of chunkText(answer)) {
            sendEvent(controller, { type: "token", value: token });
            await new Promise((resolve) => setTimeout(resolve, 18));
          }
        }

        sendEvent(controller, { type: "done" });
      } catch {
        const answer = fallbackAnswer(message, context);
        sendEvent(controller, { type: "token", value: answer });
        sendEvent(controller, {
          type: "error",
          value: " Assistant switched to local knowledge because the AI provider did not respond."
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no"
    }
  });
}
