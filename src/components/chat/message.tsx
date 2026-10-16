"use client";

import { AlertTriangle, Check, Copy, RotateCcw, Zap } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSmoothText } from "@/hooks/use-smooth-text";
import { looksTruncated, parseAnswer, reflowLists } from "@/lib/answer-format";
import type { ChatMessage } from "@/lib/chat-controller";
import type { Source } from "@/lib/legal-engine";
import { cn } from "@/lib/utils";
import { useChatController } from "./chat-provider";
import { CitationCard, CitationCardPending } from "./citation-card";
import { Markdown } from "./markdown";
import { Thinking } from "./thinking";

export const UserMessage = memo(function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-1",
        message.live && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
      )}
    >
      <p className="max-w-[min(85%,36rem)] rounded-xl rounded-br-lg bg-secondary px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-secondary-foreground [overflow-wrap:anywhere]">
        {message.content}
      </p>
      <CopyButton text={message.content} label="Copy question" className="text-muted-foreground" />
    </div>
  );
});

export const AssistantMessage = memo(function AssistantMessage({ message }: { message: ChatMessage }) {
  const { status, content } = message;
  const shown = useSmoothText(content, Boolean(message.live) && (status === "streaming" || status === "done"));
  // Still revealing text: hold back everything that belongs after the answer.
  const typing = status === "streaming" || shown.length < content.length;
  const thinking = (status === "waiting" || status === "processing") && !content ? status : null;

  return (
    <article
      aria-label="Answer"
      className={cn("flex gap-3 sm:gap-4", message.live && "animate-in fade-in-0 duration-500")}
    >
      <LogoMark className="mt-0.5 size-7 rounded-md" />
      <div className="min-w-0 flex-1">
        {thinking ? (
          <Thinking status={thinking} startedAt={message.startedAt} cached={message.cached} />
        ) : content ? (
          <Answer text={shown} typing={typing} truncated={!typing && status === "done" && looksTruncated(content)} />
        ) : null}

        {!typing && (
          <>
            {status === "error" && <ErrorNotice message={message} hasContent={Boolean(content)} />}
            {status === "stopped" && !content && (
              <p className="text-sm text-muted-foreground italic">You stopped this answer.</p>
            )}
            {message.sources && message.sources.length > 0 && <Sources sources={message.sources} />}
            {(status === "done" || status === "stopped") && <MessageActions message={message} />}
          </>
        )}
      </div>
    </article>
  );
});

function Answer({ text, typing, truncated }: { text: string; typing: boolean; truncated: boolean }) {
  const { citation, citationPending, body } = parseAnswer(text, !typing);
  const markdown = useMemo(() => reflowLists(body), [body]);

  return (
    <div>
      {citation ? (
        <CitationCard citation={citation} className="mb-4" />
      ) : citationPending ? (
        <CitationCardPending className="mb-4" />
      ) : null}
      {markdown ? (
        <Markdown typing={typing}>{markdown}</Markdown>
      ) : typing && !citationPending ? (
        <span aria-hidden className="inline-block h-[1.1em] w-[0.5em] animate-caret rounded-[2px] bg-brand align-text-bottom" />
      ) : null}
      {truncated && (
        <p className="mt-3 text-xs text-muted-foreground">
          This answer reached the engine&apos;s length limit and may be cut off.
        </p>
      )}
    </div>
  );
}

function Sources({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Sources</p>
      <ol className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <li
            key={`${source.law}-${source.section}-${index}`}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs shadow-soft"
          >
            <span className="font-mono font-semibold text-brand">{index + 1}</span>
            <span className="truncate">
              {source.law}
              {source.section !== undefined && ` · §${source.section}`}
              {source.section_title && ` — ${source.section_title}`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ErrorNotice({ message, hasContent }: { message: ChatMessage; hasContent: boolean }) {
  const controller = useChatController();
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center",
        hasContent && "mt-4",
      )}
    >
      <div className="flex flex-1 gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium">{hasContent ? "The answer was interrupted" : "Couldn't get an answer"}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{message.error}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="self-start sm:self-center" onClick={() => controller.retry(message.id)}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}

function MessageActions({ message }: { message: ChatMessage }) {
  const controller = useChatController();

  return (
    <div className="mt-3 flex animate-in items-center gap-1 text-muted-foreground fade-in-0 duration-300">
      {message.content && <CopyButton text={message.content} label="Copy answer" />}
      {message.status === "stopped" && message.content && (
        <span className="mx-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">Stopped</span>
      )}
      {/* The engine caches answers per question, so only a stopped answer is worth asking again. */}
      {message.status === "stopped" && message.question && (
        <Button variant="ghost" size="sm" onClick={() => controller.retry(message.id)}>
          <RotateCcw /> Answer again
        </Button>
      )}
      {message.cached && (
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
          <Zap className="size-3 text-warning" /> Instant answer
        </span>
      )}
    </div>
  );
}

function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); nothing useful to do.
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" className={className} onClick={copy} aria-label={copied ? "Copied" : label}>
          {copied ? <Check className="text-success" /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}
