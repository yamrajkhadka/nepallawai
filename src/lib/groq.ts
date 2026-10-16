/**
 * Server-side access to openai/gpt-oss-120b on Groq, which runs the conversation
 * around the legal engine. Import this only from route handlers: it reads the
 * API key.
 */
import { HISTORY_TURNS, type Turn } from "./assistant";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
/** Same limit as the chat composer. */
export const MAX_MESSAGE_LENGTH = 2000;
const MAX_TURN_LENGTH = 1500;

export async function callGroq(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, reasoning_effort: "low", ...body }),
    signal,
  });
  if (!response.ok) throw new Error(`Groq returned ${response.status}: ${await response.text()}`);
  return response;
}

/** Reads `{ message, history }` from a request, trimmed to what Groq needs. */
export async function readChatRequest(request: Request): Promise<{ message: string; history: Turn[] } | null> {
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  if (!message) return null;

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(isTurn)
    .slice(-HISTORY_TURNS)
    .map((turn: Turn) => ({ role: turn.role, content: turn.content.slice(0, MAX_TURN_LENGTH) }));
  return { message, history };
}

function isTurn(value: unknown): value is Turn {
  const turn = value as Turn | null;
  return (turn?.role === "user" || turn?.role === "assistant") && typeof turn.content === "string";
}
