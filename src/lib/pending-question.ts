/**
 * Carries a question from the landing page through Google sign-in to the chat,
 * so the user never has to type it twice. (Key kept from the original app.)
 */
const KEY = "initialQuery";

export function stashQuestion(question: string) {
  try {
    localStorage.setItem(KEY, question);
  } catch {
    // Storage unavailable — the user will just retype the question.
  }
}

export function peekQuestion(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function takeQuestion(): string | null {
  const question = peekQuestion();
  if (question !== null) {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Ignore.
    }
  }
  return question?.trim() || null;
}
