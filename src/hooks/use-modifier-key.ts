"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** "⌘" on Apple devices, "Ctrl" elsewhere — for keyboard shortcut hints. */
export function useModifierKey(): string {
  return useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}
