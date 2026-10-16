/**
 * Answers greetings and follow-ups about earlier answers conversationally,
 * streaming plain text. New legal questions go to the legal engine instead.
 *
 * Request `{ message, history }` → a `text/plain` stream of the reply.
 */
import { callGroq, readChatRequest } from "@/lib/groq";

const INSTRUCTIONS = `You are Nepal Law AI, a friendly assistant that explains the laws of Nepal in plain language. Earlier answers in this conversation came from a legal engine that searches the Constitution of Nepal, the National Civil Code and the National Penal Code.

- Reply in the language of the user's newest message (English, Nepali or romanized Nepali).
- For greetings, thanks or small talk, reply briefly and warmly, and invite a question about Nepali law.
- When the user asks about earlier answers, work only from what the conversation says. Don't add legal facts, section numbers or penalties that aren't in it; if they need new legal information, ask them to put it as a question.
- If asked about yourself: you explain Nepali law and cite the Act and section; you give legal information, not legal advice.
- Keep replies short. Use Markdown lists only when they help.`;

export async function POST(request: Request) {
  const chat = await readChatRequest(request);
  if (!chat) return Response.json({ error: "Missing message." }, { status: 400 });

  let upstream: Response;
  try {
    upstream = await callGroq(
      {
        messages: [{ role: "system", content: INSTRUCTIONS }, ...chat.history, { role: "user", content: chat.message }],
        max_completion_tokens: 2048,
        stream: true,
      },
      request.signal,
    );
  } catch (error) {
    console.error("Reply failed:", error);
    return Response.json({ error: "Couldn't reply." }, { status: 502 });
  }

  return new Response(contentStream(upstream.body!), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Turns Groq's server-sent events into a stream of just the reply text. */
function contentStream(events: ReadableStream): ReadableStream<Uint8Array> {
  const reader = events.pipeThrough(new TextDecoderStream()).getReader();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    // Keep reading until there's reply text to hand on: a pull that enqueues
    // nothing (e.g. only reasoning events) is never called again.
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let sent = false;
        for (const line of lines) {
          const data = line.startsWith("data:") ? line.slice(5).trim() : "";
          if (!data || data === "[DONE]") continue;
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
            sent = true;
          }
        }
        if (sent) return;
      }
    },
    cancel(reason) {
      void reader.cancel(reason);
    },
  });
}
