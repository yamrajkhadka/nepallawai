"use client";

import { ArrowUp, Copy, Lock, SquarePen, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { CitationCard } from "@/components/chat/citation-card";
import type { Citation } from "@/lib/answer-format";
import { cn } from "@/lib/utils";

// A real answer from the engine, lightly trimmed.
const QUESTION = "What is the penalty for theft?";
const CITATION: Citation = {
  law: "National Penal Code 2017",
  division: { label: "Chapter", value: "Offences Relating to Theft and Robbery" },
  provision: { label: "Section", number: "241", title: "Prohibition of theft" },
};
const ANSWER =
  "This means that if someone takes something that doesn't belong to them without permission, they can be punished by law. The punishment can vary depending on the circumstances and the value of what was stolen. If the stolen item is more valuable, or if the person has committed multiple thefts, they could face harsher penalties such as imprisonment.";

const history = ["Penalty for theft", "Rights of tenants in Nepal", "Divorce process in Civil Code", "How is citizenship acquired?"];

type Phase = "idle" | "asked" | "searching" | "answering" | "done";

export function ProductPreview() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);

  // Play the conversation once, when it scrolls into view.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setPhase("done");
          setTyped(ANSWER.length);
          return;
        }
        setPhase("asked");
        timers.push(setTimeout(() => setPhase("searching"), 700));
        timers.push(
          setTimeout(() => {
            setPhase("answering");
            let count = 0;
            interval = setInterval(() => {
              count = Math.min(ANSWER.length, count + 3);
              setTyped(count);
              if (count === ANSWER.length) {
                clearInterval(interval);
                timers.push(setTimeout(() => setPhase("done"), 250));
              }
            }, 22);
          }, 2300),
        );
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const showAnswer = phase === "answering" || phase === "done";

  return (
    <div ref={root} className="relative">
      <div
        aria-hidden
        className="absolute inset-x-[-8%] -top-16 -bottom-10 -z-10 bg-[radial-gradient(60%_60%_at_50%_30%,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_70%)] blur-2xl"
      />
      <div
        role="img"
        aria-label={`Example: asking “${QUESTION}” returns an answer citing Section 241 of the National Penal Code 2017.`}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_40px_100px_-30px_oklch(0.2_0.03_265/0.35)] ring-1 ring-black/[0.03] dark:shadow-[0_40px_120px_-30px_black]"
      >
        {/* Window chrome */}
        <div className="flex h-11 items-center gap-3 border-b border-border bg-muted/40 px-4">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-2.5 rounded-full bg-foreground/15" />
            ))}
          </div>
          <div className="mx-auto flex h-6 max-w-[16rem] flex-1 items-center justify-center gap-1.5 rounded-md bg-background/80 px-3 text-[11px] text-muted-foreground ring-1 ring-border">
            <Lock className="size-3" />
            <span className="truncate">nepallawai.yamrajkhadka.com.np/chat</span>
          </div>
          <div className="w-10" aria-hidden />
        </div>

        <div className="grid md:grid-cols-[13.5rem_1fr]" aria-hidden>
          {/* Mini sidebar */}
          <aside className="hidden flex-col gap-1 border-r border-border bg-sidebar p-3 md:flex">
            <div className="mb-2 flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs font-medium shadow-soft">
              <SquarePen className="size-3.5 text-brand" /> New chat
            </div>
            <p className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Today</p>
            {history.map((title, index) => (
              <div
                key={title}
                className={cn(
                  "relative truncate rounded-md px-2.5 py-1.5 text-xs",
                  index === 0 ? "bg-sidebar-accent font-medium" : "text-muted-foreground",
                )}
              >
                {index === 0 && <span className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-brand" />}
                {title}
              </div>
            ))}
          </aside>

          {/* Conversation */}
          <div className="flex min-h-[27rem] flex-col p-4 sm:p-7">
            <div className="flex flex-1 flex-col gap-6">
              <div
                className={cn(
                  "flex justify-end transition-all duration-500",
                  phase === "idle" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
                )}
              >
                <p className="rounded-xl rounded-br-lg bg-secondary px-4 py-2.5 text-sm">{QUESTION}</p>
              </div>

              <div
                className={cn(
                  "flex gap-3 transition-opacity duration-500",
                  phase === "idle" || phase === "asked" ? "opacity-0" : "opacity-100",
                )}
              >
                <LogoMark className="size-7 rounded-md" />
                <div className="min-w-0 flex-1">
                  {phase === "searching" && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3.5 text-sm shadow-soft">
                      <span className="relative flex size-4">
                        <span className="absolute inset-0 rounded-full border-2 border-brand/15" />
                        <span className="absolute inset-0 animate-orbit rounded-full border-2 border-transparent border-t-brand" />
                      </span>
                      <span className="text-shimmer font-medium">Searching 5,800+ provisions…</span>
                    </div>
                  )}
                  {showAnswer && (
                    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
                      <CitationCard citation={CITATION} className="mb-4" />
                      <div className="relative text-sm leading-relaxed sm:text-[15px] sm:leading-7">
                        <p className="invisible">{ANSWER}</p>
                        <p className="absolute inset-0">
                          {ANSWER.slice(0, typed)}
                          {phase === "answering" && (
                            <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] animate-caret rounded-[2px] bg-brand align-text-bottom" />
                          )}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "mt-3 flex items-center gap-2 text-muted-foreground transition-opacity duration-500",
                          phase === "done" ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <span className="flex size-7 items-center justify-center rounded-md hover:bg-muted">
                          <Copy className="size-3.5" />
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                          <Zap className="size-3 text-warning" /> Instant answer
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-background/60 p-2 pl-4 text-sm text-muted-foreground shadow-soft">
              <span className="flex-1 truncate">Ask a follow-up question…</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground">
                <ArrowUp className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
