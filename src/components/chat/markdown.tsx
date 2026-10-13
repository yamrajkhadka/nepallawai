"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const remarkPlugins = [remarkGfm];

export const Markdown = memo(function Markdown({
  children,
  className,
  typing,
}: {
  children: string;
  className?: string;
  typing?: boolean;
}) {
  return (
    <div className={cn("prose-answer", className)} data-typing={typing || undefined}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
