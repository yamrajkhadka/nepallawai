import { Plus } from "lucide-react";
import { faqs } from "@/lib/site";
import { SectionHeading } from "./section-heading";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading eyebrow="FAQ" title="Questions, answered." />
      <div className="mt-14 divide-y divide-border border-y border-border">
        {faqs.map((faq, index) => (
          <details key={faq.question} name="faq" open={index === 0} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium transition-colors hover:text-brand sm:text-lg [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border transition-all duration-300 group-open:rotate-45 group-open:border-brand/40 group-open:bg-brand group-open:text-brand-foreground">
                <Plus className="size-4" />
              </span>
            </summary>
            <p className="pr-14 pb-6 leading-relaxed text-pretty text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
