"use client";

import { useEffect, useState } from "react";

/** Seconds since `since`, ticking once a second while `active`. */
export function useElapsed(since: number | undefined, active: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active || since === undefined) return;
    const update = () => setSeconds(Math.max(0, Math.floor((Date.now() - since) / 1000)));
    const first = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [since, active]);

  return seconds;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
