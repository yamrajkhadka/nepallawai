"use client";

import { Button } from "@/components/ui/button";
import { useAsk } from "./use-ask";

/** Any button on the landing page that starts a chat, optionally with a question. */
export function AskButton({
  question,
  source,
  className,
  children,
  variant,
}: {
  question?: string;
  source: string;
  className?: string;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const ask = useAsk();
  return (
    <Button variant={variant} className={className} onClick={() => void ask(question, source)}>
      {children}
    </Button>
  );
}

export function AskLink({ question, source, className }: { question: string; source: string; className?: string }) {
  const ask = useAsk();
  return (
    <button type="button" className={className} onClick={() => void ask(question, source)}>
      {question}
    </button>
  );
}
