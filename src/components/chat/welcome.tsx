"use client";

import { ArrowUpRight, Gavel, HeartHandshake, House, Landmark } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { firstName } from "@/hooks/use-auth-session";
import { useChat, useChatController } from "./chat-provider";
import { Composer } from "./composer";

const suggestions = [
  { icon: House, topic: "Tenancy", question: "Rights of tenants in Nepal" },
  { icon: Gavel, topic: "Criminal law", question: "What is the penalty for theft?" },
  { icon: HeartHandshake, topic: "Family", question: "Divorce process in Civil Code" },
  { icon: Landmark, topic: "Constitution", question: "What fundamental rights does the Constitution guarantee?" },
];

export function Welcome({ withComposer, onSend }: { withComposer: boolean; onSend?: () => void }) {
  const controller = useChatController();
  const user = useChat((s) => s.user);
  const busy = useChat((s) => s.generating !== null);
  const name = firstName(user);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-7 animate-fade-up">
        <div aria-hidden className="absolute inset-0 -z-10 animate-glow rounded-full bg-brand/30 blur-2xl" />
        <LogoMark className="size-14 rounded-md" />
      </div>
      <h2 className="animate-fade-up font-serif text-4xl tracking-tight text-balance [animation-delay:60ms] sm:text-5xl">
        Namaste{name ? `, ${name}` : ""}.
      </h2>
      <p className="mt-3 max-w-md animate-fade-up text-balance text-muted-foreground [animation-delay:120ms]">
        What would you like to understand about Nepali law today?
      </p>

      {withComposer && (
        <div className="mt-9 w-full animate-fade-up text-left [animation-delay:180ms]">
          <Composer autoFocus onSend={onSend} />
        </div>
      )}

      <ul className="mt-8 grid w-full animate-fade-up gap-3 [animation-delay:240ms] sm:grid-cols-2">
        {suggestions.map(({ icon: Icon, topic, question }) => (
          <li key={question}>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void controller.send(question);
                onSend?.();
              }}
              className="group flex h-full w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-soft transition duration-200 outline-none hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-elevated focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {topic}
                </span>
                <span className="mt-0.5 block text-sm leading-snug font-medium">{question}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
