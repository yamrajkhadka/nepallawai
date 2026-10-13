import { BookOpen } from "lucide-react";
import type { Citation } from "@/lib/answer-format";
import { cn } from "@/lib/utils";

export function CitationCard({ citation, className }: { citation: Citation; className?: string }) {
  const { law, division, provision } = citation;

  return (
    <figure
      className={cn(
        "flex items-start gap-3.5 rounded-lg border border-brand/20 bg-brand-soft/70 p-3.5 sm:p-4 dark:bg-brand-soft",
        className,
      )}
    >
      <div
        aria-hidden
        className="flex min-w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-background/85 px-2.5 py-2 shadow-soft ring-1 ring-brand/15"
      >
        {provision ? (
          <>
            <span className="font-serif text-xl leading-none text-brand">§</span>
            <span className="mt-1 font-mono text-[13px] font-semibold tabular-nums">{provision.number}</span>
          </>
        ) : (
          <BookOpen className="my-1.5 size-5 text-brand" />
        )}
      </div>
      <figcaption className="min-w-0 pt-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">
          {provision ? `${provision.label} ${provision.number}` : "Governing law"}
        </p>
        <p className="mt-0.5 font-serif text-[1.2rem] leading-snug text-balance">
          {provision?.title ?? law}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {provision?.title ? law : null}
          {provision?.title && division ? <span aria-hidden> · </span> : null}
          {division ? `${division.label}: ${division.value}` : null}
        </p>
      </figcaption>
    </figure>
  );
}

export function CitationCardPending({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-lg border border-dashed border-brand/25 bg-brand-soft/40 p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-background/70 ring-1 ring-brand/10">
        <span className="font-serif text-2xl leading-none text-brand/70">§</span>
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-shimmer text-sm font-medium">Citing the governing provision…</p>
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-brand/10" />
      </div>
    </div>
  );
}
