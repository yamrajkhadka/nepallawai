"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 80;

/**
 * Follow streaming content while the reader is at the bottom; stop following
 * the moment they scroll up, and resume once they come back down.
 */
export function useStickToBottom<Scroller extends HTMLElement, Content extends HTMLElement>() {
  const scrollRef = useRef<Scroller>(null);
  const contentRef = useRef<Content>(null);
  const stuck = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    let lastTop = scroller.scrollTop;
    const onScroll = () => {
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      const bottom = distance <= THRESHOLD;
      if (bottom) stuck.current = true;
      else if (scroller.scrollTop < lastTop - 1) stuck.current = false;
      lastTop = scroller.scrollTop;
      setAtBottom(bottom);
    };

    const observer = new ResizeObserver(() => {
      if (stuck.current) scroller.scrollTop = scroller.scrollHeight;
      onScroll();
    });

    scroller.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(content);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    stuck.current = true;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
  }, []);

  return { scrollRef, contentRef, atBottom, scrollToBottom };
}
