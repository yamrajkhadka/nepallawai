/**
 * The conversation layer around the legal engine, which only ever sees one
 * question. Each message is first read in the context of the conversation
 * (/api/understand):
 *   - "legal": rewritten as a standalone question and sent to the engine
 *   - "chat": greetings and follow-ups about earlier answers, answered by /api/reply
 *   - "off_topic": answered with OFF_TOPIC_REPLY
 */

export type Turn = { role: "user" | "assistant"; content: string };

export type Understanding = { kind: "legal" | "chat" | "off_topic"; question: string };

/** How many earlier messages are sent along as context. */
export const HISTORY_TURNS = 8;

export const OFF_TOPIC_REPLY =
  "I can only help with questions about Nepali law, such as the Constitution of Nepal, the National Civil Code or the National Penal Code. Please ask a legal question and I'll point you to the relevant section.";

export async function understand(message: string, history: Turn[], signal: AbortSignal): Promise<Understanding> {
  const response = await fetch("/api/understand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });
  if (!response.ok) throw new Error(`Understanding the message failed (${response.status})`);
  return response.json();
}

/** Streams a conversational reply, calling `onText` with the full text so far. */
export async function streamReply(
  message: string,
  history: Turn[],
  signal: AbortSignal,
  onText: (text: string) => void,
): Promise<string> {
  const response = await fetch("/api/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });
  if (!response.ok || !response.body) throw new Error(`Reply failed (${response.status})`);

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
    onText(text.trimStart());
  }
  if (!text.trim()) throw new Error("Empty reply");
  return text.trim();
}
