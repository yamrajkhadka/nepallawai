"use client";

import { ArrowUp, Square } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MAX_QUESTION_LENGTH } from "@/lib/chat-controller";
import { cn } from "@/lib/utils";
import { useChat, useChatController } from "./chat-provider";

const MAX_HEIGHT = 220;

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function Composer({ autoFocus, onSend, className }: { autoFocus?: boolean; onSend?: () => void; className?: string }) {
  const controller = useChatController();
  const activeKey = useChat((s) => s.activeKey);
  const generatingKey = useChat((s) => s.generating?.key ?? null);
  const sessionReady = useChat((s) => s.sessions[s.activeKey]?.status === "ready");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const [value, setValue] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);

  const answeringHere = generatingKey !== null && generatingKey === activeKey;
  const answeringElsewhere = generatingKey !== null && !answeringHere;
  const canSend = value.trim().length > 0 && generatingKey === null && sessionReady;

  // Grow with the content up to MAX_HEIGHT, then scroll.
  useLayoutEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  // "/" jumps to the composer from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || isTypingTarget(event.target)) return;
      event.preventDefault();
      textarea.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submit = () => {
    if (!canSend) return;
    void controller.send(value);
    setValue("");
    onSend?.();
    if (!coarsePointer) textarea.current?.focus();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn("w-full", className)}
    >
      <div className="rounded-xl border border-input bg-card shadow-elevated transition-[border-color,box-shadow] focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10">
        <label htmlFor="composer-input" className="sr-only">
          Ask a legal question
        </label>
        <textarea
          id="composer-input"
          ref={textarea}
          rows={1}
          value={value}
          maxLength={MAX_QUESTION_LENGTH}
          autoFocus={autoFocus && !coarsePointer}
          placeholder={
            answeringElsewhere ? "Another conversation is still being answered…" : "Ask a question about Nepali law…"
          }
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // On phones Enter adds a new line; the send button submits.
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !coarsePointer) {
              event.preventDefault();
              submit();
            }
          }}
          className="block max-h-[220px] w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/80"
        />
        <div className="flex items-center justify-between gap-3 px-3 pt-1 pb-3">
          <p className="hidden items-center gap-1.5 pl-2 text-xs text-muted-foreground sm:flex">
            <Kbd>↵</Kbd> to send <span className="text-border">·</span> <Kbd>⇧</Kbd>
            <Kbd>↵</Kbd> new line
          </p>
          <div className="ml-auto flex items-center gap-2">
            {value.length > MAX_QUESTION_LENGTH * 0.85 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {value.length}/{MAX_QUESTION_LENGTH}
              </span>
            )}
            {answeringHere ? (
              <Button
                type="button"
                size="icon"
                onClick={() => controller.stop()}
                aria-label="Stop answering"
                className="size-9 rounded-full"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                aria-label="Send question"
                className="size-9 rounded-full bg-brand text-brand-foreground shadow-brand hover:bg-brand-strong disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none"
              >
                <ArrowUp className="size-[18px]" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2.5 px-2 text-center text-[11.5px] leading-relaxed text-muted-foreground">
        Nepal Law AI can make mistakes and isn&apos;t a lawyer. Check important matters with a licensed advocate.
      </p>
    </form>
  );
}
