"use client";

import { createContext, use } from "react";

export type Shell = { desktop: boolean; sidebarOpen: boolean; toggleSidebar: () => void };

export const ShellContext = createContext<Shell | null>(null);

export function useShell(): Shell {
  const shell = use(ShellContext);
  if (!shell) throw new Error("useShell must be used inside <ChatApp>");
  return shell;
}
