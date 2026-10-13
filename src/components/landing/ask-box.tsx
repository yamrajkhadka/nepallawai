"use client";

import { ArrowUp, LoaderCircle, Search } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { wakeEngine } from "@/lib/legal-engine";
import { sampleQuestions } from "@/lib/site";
import { useAsk } from "./use-ask";

const quickQuestions = ["What is the penalty for theft?", "Rights of tenants in Nepal", "Divorce process in Civil Code"];

/** Types sample questions into the placeholder, one after another. */
function useTypewriter(phrases: readonly string[], active: boolean) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = setTimeout(() => setText(phrases[0]), 0);
      return () => clearTimeout(timer);
    }

    let phrase = 0;
    let length = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = phrases[phrase];
      length += deleting ? -1 : 1;
      setText(current.slice(0, length));
      if (!deleting && length === current.length) {
        deleting = true;
        timer = setTimeout(tick, 2400);
      } else if (deleting && length === 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        timer = setTimeout(tick, 350);
      } else {
        timer = setTimeout(tick, deleting ? 16 : 34 + Math.random() * 46);
      }
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [phrases, active]);

  return text;
}

export function AskBox() {
  const ask = useAsk();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const typed = useTypewriter(sampleQuestions, !focused && !value);

  // Wake the engine while the visitor is still reading, so their first answer starts sooner.
  useEffect(() => {
    wakeEngine();
  }, []);

  useLayoutEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [value]);

  const submit = (question: string, source: string) => {
    setPending(true);
    void ask(question, source);
  };

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(value, "hero");
        }}
        className="text-left"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 pl-4 shadow-elevated transition-shadow focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10">
          <Search className="mb-[1.05rem] size-5 shrink-0 text-muted-foreground" aria-hidden />
          <textarea
            ref={textarea}
            rows={1}
            value={value}
            aria-label="Ask a question about Nepali law"
            placeholder={focused ? "Ask about tenancy, divorce, theft, citizenship…" : typed}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit(value, "hero");
              }
            }}
            className="max-h-40 min-h-[3.25rem] flex-1 resize-none bg-transparent py-3.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground sm:text-lg"
          />
          <Button
            type="submit"
            disabled={pending}
            aria-label="Ask"
            className="h-12 shrink-0 gap-1.5 rounded-lg bg-brand px-4 text-base font-semibold text-brand-foreground hover:bg-brand-strong sm:px-5"
          >
            <span className="hidden sm:inline">Search</span>
            {pending ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">Try:</span>
        {quickQuestions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={pending}
            onClick={() => submit(question, "hero_chip")}
            className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-60"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
