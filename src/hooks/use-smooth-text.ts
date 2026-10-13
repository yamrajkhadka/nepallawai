"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The engine streams a token every ~0.5s. Revealing each chunk letter by letter
 * between arrivals turns that stutter into steady typing. Text already present
 * when the component mounts is shown immediately — only new text animates — and
 * turning `animate` off shows everything at once (e.g. when the user hits Stop).
 */
export function useSmoothText(text: string, animate: boolean): string {
  const [visible, setVisible] = useState(text.length);
  const position = useRef(text.length);
  const previous = useRef(text);

  useEffect(() => {
    // A different text (e.g. a retried answer) reveals from the start.
    const kept = Math.min(Math.floor(position.current), text.length);
    if (text.slice(0, kept) !== previous.current.slice(0, kept)) position.current = 0;
    previous.current = text;

    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      position.current = text.length;
      // Keep the counter in sync so a later reveal (e.g. a retry) doesn't flash stale text.
      const frame = requestAnimationFrame(() => setVisible(text.length));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const target = text.length;
      const current = Math.min(position.current, target);
      if (current >= target) {
        position.current = target;
        setVisible(target);
        return;
      }
      const elapsed = Math.min(64, now - last);
      last = now;
      // Aim to drain the backlog in ~0.6s (about one token interval), never slower than 12 chars/s.
      const speed = Math.max(0.012, (target - current) / 600);
      position.current = Math.min(target, current + speed * elapsed);
      setVisible(Math.floor(position.current));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, animate]);

  return animate ? text.slice(0, visible) : text;
}
