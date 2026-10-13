import { ArrowUpRight } from "lucide-react";
import { legalCodes } from "@/lib/site";
import { AskLink } from "./ask-button";
import { SectionHeading } from "./section-heading";

export function Coverage() {
  return (
    <section id="coverage" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Coverage"
        title="The codes that shape everyday life."
        description="Three foundational texts — searched section by section every time you ask."
      />

      {/* Subgrid lines up the header, summary and questions across all three cards. */}
      <div className="mt-16 grid gap-4 md:grid-cols-3 md:grid-rows-[auto_1fr_auto]">
        {legalCodes.map((code) => (
          <article
            key={code.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-7 shadow-soft md:row-span-3 md:grid md:grid-rows-subgrid md:gap-0"
          >
            <div>
              <p lang="ne" className="text-sm text-muted-foreground">
                {code.nepali}
              </p>
              <h3 className="mt-1 font-serif text-2xl leading-tight">{code.name}</h3>
              <p className="mt-1 font-mono text-xs text-brand">{code.year}</p>
            </div>
            <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">{code.summary}</p>
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Try asking</p>
              <ul className="space-y-1">
                {code.questions.map((question) => (
                  <li key={question} className="group/q flex items-start gap-2">
                    <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-brand transition-transform group-hover/q:translate-x-0.5 group-hover/q:-translate-y-0.5" />
                    <AskLink
                      question={question}
                      source={`coverage_${code.id}`}
                      className="text-left text-sm font-medium underline-offset-4 hover:text-brand hover:underline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
