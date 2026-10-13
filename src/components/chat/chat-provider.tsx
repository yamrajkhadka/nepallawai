"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChatController, type ChatState } from "@/lib/chat-controller";
import type { EngineStatus } from "@/lib/legal-engine";

const ChatContext = createContext<ChatController | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [controller] = useState(() => new ChatController());
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    controller.start({
      push: (href) => routerRef.current.push(href),
      replace: (href) => routerRef.current.replace(href),
    });
    return () => controller.dispose();
  }, [controller]);

  return <ChatContext value={controller}>{children}</ChatContext>;
}

export function useChatController(): ChatController {
  const controller = use(ChatContext);
  if (!controller) throw new Error("useChatController must be used inside <ChatProvider>");
  return controller;
}

/** Subscribe to a slice of chat state. The selector must return a stable value (a primitive or an existing object). */
export function useChat<T>(selector: (state: ChatState) => T): T {
  const controller = useChatController();
  return useSyncExternalStore(
    controller.subscribe,
    () => selector(controller.getState()),
    () => selector(controller.getState()),
  );
}

export function useEngineStatus(): EngineStatus {
  const { engine } = useChatController();
  return useSyncExternalStore(engine.subscribe, engine.getStatus, () => "connecting" as const);
}
