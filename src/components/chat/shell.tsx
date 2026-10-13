"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ChatProvider, useChat, useChatController } from "./chat-provider";
import { ChatView } from "./chat-view";
import { ShellContext } from "./shell-context";
import { Sidebar } from "./sidebar";

const COLLAPSED_KEY = "nla-sidebar-collapsed";

/**
 * The whole chat UI lives in the layout so it never remounts while navigating
 * between conversations — the route only tells the controller which one to show.
 */
export function ChatApp({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <TooltipProvider>
        <AuthGate>
          <ChatShell />
        </AuthGate>
        {children}
      </TooltipProvider>
    </ChatProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const signedIn = useChat((s) => s.user !== null);
  if (signedIn) return children;

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background" role="status">
      <LogoMark className="size-12 animate-pulse rounded-md" />
      <p className="text-sm text-muted-foreground">Opening your workspace…</p>
    </div>
  );
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function ChatShell() {
  const controller = useChatController();
  const desktop = useMediaQuery("(min-width: 768px)", true);
  // Safe to read storage here: this component only renders on the client, after sign-in.
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (!desktop) {
      setMobileOpen((open) => !open);
      return;
    }
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Not persisted — fine.
    }
  }, [desktop, collapsed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "b" && !event.shiftKey) {
        event.preventDefault();
        toggleSidebar();
      } else if (key === "o" && event.shiftKey) {
        event.preventDefault();
        controller.newChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar, controller]);

  const sidebarOpen = desktop ? !collapsed : mobileOpen;

  return (
    <ShellContext value={{ desktop, sidebarOpen, toggleSidebar }}>
      <div className="flex h-dvh overflow-hidden bg-background">
        {desktop ? (
          <aside
            aria-label="Conversations"
            inert={collapsed}
            className={cn(
              "shrink-0 overflow-hidden border-r transition-[width,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              collapsed ? "w-0 border-transparent" : "w-[17rem] border-sidebar-border",
            )}
          >
            <div className="h-full w-[17rem]">
              <Sidebar onCollapse={toggleSidebar} />
            </div>
          </aside>
        ) : (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Conversations</SheetTitle>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        <main className="flex min-w-0 flex-1 flex-col">
          <ChatView />
        </main>
      </div>
    </ShellContext>
  );
}
