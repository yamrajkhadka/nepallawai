"use client";

import { useLayoutEffect } from "react";
import { applyTheme, useTheme } from "@/lib/theme";

/**
 * Keeps <html data-theme> correct after hydration: Strict Mode's dev remount
 * resets attributes set by the inline script, and "system" must follow OS changes.
 */
export function ThemeWatcher() {
  useTheme();
  useLayoutEffect(() => {
    applyTheme();
  }, []);
  return null;
}
