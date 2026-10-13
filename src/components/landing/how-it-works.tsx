import { SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Ask in your own words",
    body: "Type your question the way you'd ask a lawyer friend. No legal jargon, no forms.",
  },
  {
    title: "The engine finds the law",
    body: "It searches the Constitution and the Civil and Penal Codes for the provisions that actually apply.",
  },
  {
    title: "Read a cited answer",
    body: "A clear explanation, written live in front of you and anchored to the exact section it relies on.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-y border-border bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From question to citation."
        />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden
            className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-[repeating-linear-gradient(90deg,var(--border)_0_8px,transparent_8px_16px)] md:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative text-center">
              <span className="relative mx-auto flex size-14 items-center justify-center rounded-md bg-brand font-serif text-2xl text-brand-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
