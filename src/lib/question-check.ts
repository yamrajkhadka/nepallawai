/**
 * The legal engine answers anything it's sent, so every question is screened by
 * /api/check-question first and only questions about Nepali law reach it.
 */

export const OFF_TOPIC_REPLY =
  "I can only help with questions about Nepali law, such as the Constitution of Nepal, the National Civil Code or the National Penal Code. Please ask a legal question and I'll point you to the relevant section.";

export async function isAboutNepaliLaw(question: string, signal: AbortSignal): Promise<boolean> {
  const response = await fetch("/api/check-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });
  if (!response.ok) throw new Error(`Question check failed (${response.status})`);
  const { allowed } = (await response.json()) as { allowed?: boolean };
  return allowed === true;
}
