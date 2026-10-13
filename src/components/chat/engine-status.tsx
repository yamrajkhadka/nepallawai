"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { EngineStatus as Status } from "@/lib/legal-engine";
import { cn } from "@/lib/utils";
import { useEngineStatus } from "./chat-provider";

const states: Record<Status, { label: string; tone: string; pulse: boolean; help: string }> = {
  online: {
    label: "Online",
    tone: "bg-success",
    pulse: false,
    help: "Connected to the legal engine — the model and the legal index are loaded.",
  },
  connecting: {
    label: "Connecting",
    tone: "bg-warning",
    pulse: true,
    help: "Opening a connection to the legal engine…",
  },
  reconnecting: {
    label: "Waking engine",
    tone: "bg-warning",
    pulse: true,
    help: "The engine sleeps when idle and can take a minute to wake up. Questions you ask now are sent as soon as it's ready.",
  },
  offline: {
    label: "Offline",
    tone: "bg-muted-foreground",
    pulse: false,
    help: "You're offline. We'll reconnect automatically when your connection is back.",
  },
};

export function EngineStatus({ className }: { className?: string }) {
  const status = useEngineStatus();
  const { label, tone, pulse, help } = states[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "inline-flex h-7 shrink-0 cursor-default items-center gap-2 rounded-full border border-border bg-card/80 px-2.5 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            className,
          )}
        >
          <span className="relative flex size-2">
            {pulse && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", tone)} />}
            <span className={cn("relative inline-flex size-2 rounded-full", tone)} />
          </span>
          <span>
            <span className="sr-only">Legal engine: </span>
            {label}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        {help}
      </TooltipContent>
    </Tooltip>
  );
}
