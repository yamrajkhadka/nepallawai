"use client";

import { ArrowDown, PanelLeft, RotateCcw, SearchX, SquarePen } from "lucide-react";
import { useParams } from "next/navigation";
import { memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useModifierKey } from "@/hooks/use-modifier-key";
import { useStickToBottom } from "@/hooks/use-stick-to-bottom";
import { type ChatMessage, isDraftKey } from "@/lib/chat-controller";
import { cn } from "@/lib/utils";
import { useChat, useChatController } from "./chat-provider";
import { Composer } from "./composer";
import { EngineStatus } from "./engine-status";
import { AssistantMessage, UserMessage } from "./message";
import { useShell } from "./shell-context";
import { Welcome } from "./welcome";

const NO_MESSAGES: ChatMessage[] = [];

export function ChatView() {
  const controller = useChatController();
  const params = useParams<{ id?: string }>();
  const routeId = typeof params.id === "string" ? params.id : "new";
  const activeKey = useChat((s) => s.activeKey);
  const session = useChat((s) => s.sessions[s.activeKey]);
  const announcement = useChat((s) => s.announcement);
  const desktop = useMediaQuery("(min-width: 768px)", true);
  const { scrollRef, contentRef, atBottom, scrollToBottom } = useStickToBottom<HTMLDivElement, HTMLDivElement>();

  // The URL is the source of truth for which conversation is open.
  useEffect(() => {
    controller.open(routeId);
  }, [controller, routeId]);

  useEffect(() => {
    scrollToBottom("instant");
  }, [activeKey, scrollToBottom]);

  const status = session?.status ?? "loading";
  const messages = session?.messages ?? NO_MESSAGES;
  const empty = status === "ready" && messages.length === 0;
  const centered = empty && desktop;
  const followNewMessage = () => requestAnimationFrame(() => scrollToBottom("smooth"));

  return (
    <>
      <ChatHeader />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-thin">
          <div ref={contentRef} className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 sm:px-6">
            {status === "loading" ? (
              <ConversationSkeleton />
            ) : status === "missing" ? (
              <ConversationState
                icon={SearchX}
                title="This conversation doesn't exist"
                description="It may have been deleted, or the link is incomplete."
                action={
                  <Button onClick={() => controller.newChat()}>
                    <SquarePen /> Start a new chat
                  </Button>
                }
              />
            ) : status === "error" ? (
              <ConversationState
                icon={RotateCcw}
                title="Couldn't load this conversation"
                description="Check your connection and try again."
                action={
                  <Button variant="outline" onClick={() => controller.reloadActive()}>
                    <RotateCcw /> Try again
                  </Button>
                }
              />
            ) : empty ? (
              <Welcome withComposer={centered} onSend={followNewMessage} />
            ) : (
              <MessageList messages={messages} />
            )}
          </div>
        </div>

        {!centered && status !== "missing" && (
          <div className="relative shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:px-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
            <ScrollToLatest visible={!atBottom && !empty} onClick={() => scrollToBottom()} />
            <div className="mx-auto max-w-3xl">
              <Composer onSend={followNewMessage} />
            </div>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

function ChatHeader() {
  const controller = useChatController();
  const { desktop, sidebarOpen, toggleSidebar } = useShell();
  const mod = useModifierKey();
  const draft = useChat((s) => isDraftKey(s.activeKey));
  const title = useChat((s) => s.conversations.find((c) => c.id === s.activeKey)?.title ?? null);
  const showSidebarControls = !desktop || !sidebarOpen;

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 px-2 sm:px-3">
      {showSidebarControls && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
              <PanelLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Open sidebar {desktop && <Kbd className="ml-1 border-background/20 bg-transparent text-background/70">{mod}B</Kbd>}
          </TooltipContent>
        </Tooltip>
      )}
      {showSidebarControls && desktop && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => controller.newChat()} aria-label="New chat">
              <SquarePen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New chat</TooltipContent>
        </Tooltip>
      )}
      <h1 className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
        {draft ? <span className="text-muted-foreground">New conversation</span> : title}
      </h1>
      <EngineStatus />
      {!desktop && (
        <Button variant="ghost" size="icon" onClick={() => controller.newChat()} aria-label="New chat">
          <SquarePen />
        </Button>
      )}
    </header>
  );
}

const MessageList = memo(function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-8 pt-4 pb-10 sm:gap-10">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
    </div>
  );
});

function ScrollToLatest({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 -top-14 flex justify-center transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label="Scroll to latest"
        className={cn("size-9 rounded-full bg-card shadow-elevated", visible && "pointer-events-auto")}
      >
        <ArrowDown />
      </Button>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-10 pt-6" aria-label="Loading conversation">
      <Skeleton className="ml-auto h-11 w-2/5 rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="size-7 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ConversationState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <span className="mb-5 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
