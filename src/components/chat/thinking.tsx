"use client";

import { formatDuration, useElapsed } from "@/hooks/use-elapsed";
import type { MessageStatus } from "@/lib/chat-controller";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useEngineStatus } from "./chat-provider";

const steps = ["Connect", "Research", "Write"] as const;

/**
 * Shown until the first token arrives — which on the free CPU engine can take a
 * minute or more. Every step maps to a real signal from the engine.
 */
export function Thinking({
  status,
  startedAt,
  cached,
}: {
  status: Extract<MessageStatus, "waiting" | "processing">;
  startedAt?: number;
  cached?: boolean;
}) {
  const engine = useEngineStatus();
  const elapsed = useElapsed(startedAt, true);
  const step = status === "waiting" ? 0 : 1;

  const title =
    status === "processing"
      ? cached
        ? "Found a saved answer…"
        : `Searching ${siteConfig.provisionCount} provisions…`
      : engine === "offline"
        ? "You're offline — waiting for a connection…"
        : engine === "online"
          ? "Sending your question…"
          : "Waking up the legal engine…";

  return (
    <div className="rounded-lg border border-border bg-card/70 p-4 shadow-soft" role="status">
      <div className="flex items-center gap-3">
        <span aria-hidden className="relative flex size-5 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-brand/15" />
          <span className="absolute inset-0 animate-orbit rounded-full border-2 border-transparent border-t-brand" />
        </span>
        <p className="text-shimmer text-sm font-medium">{title}</p>
        <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums" aria-label={`${elapsed} seconds`}>
          {formatDuration(elapsed)}
        </span>
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Progress">
        {steps.map((label, index) => (
          <li key={label} className="space-y-1.5" aria-current={index === step ? "step" : undefined}>
            <div className="relative h-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-700",
                  index < step && "bg-brand",
                  index === step && "animate-shimmer bg-[linear-gradient(90deg,transparent,var(--brand),transparent)] bg-size-[200%_100%]",
                )}
              />
            </div>
            <p className={cn("text-[11px] font-medium", index <= step ? "text-foreground" : "text-muted-foreground/70")}>
              {label}
            </p>
          </li>
        ))}
      </ol>

      {elapsed >= 12 && !cached && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground animate-in fade-in-0 duration-700">
          The engine runs on a free CPU server, so a fresh answer usually takes a minute or two. It keeps
          working if you switch to another conversation.
        </p>
      )}
    </div>
  );
}
