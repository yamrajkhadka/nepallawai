import { ArrowRight } from "lucide-react";
import { AskButton } from "./ask-button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
      <div data-theme="dark" className="flex flex-col items-start gap-8 rounded-2xl bg-[#09090b] px-8 py-14 text-foreground sm:px-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-tight text-white">
            Understand your legal position today.
          </h2>
          <p className="mt-3 text-lg text-white/75">Free, cited, and written in plain language.</p>
        </div>
        <AskButton
          source="final_cta"
          className="h-12 shrink-0 gap-2 rounded-lg bg-white px-6 text-base font-semibold text-[#09090b] hover:bg-white/90"
        >
          Ask a legal question <ArrowRight className="size-4" />
        </AskButton>
      </div>
    </section>
  );
}
