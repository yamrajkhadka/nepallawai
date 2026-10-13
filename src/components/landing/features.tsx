import { BookOpenCheck, FileSearch, Languages, LibraryBig, MessagesSquare, Radio } from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: BookOpenCheck,
    title: "Answers you can verify",
    body: "Every answer opens with the Act, chapter and section it relies on, so you can check the original text.",
  },
  {
    icon: FileSearch,
    title: "Searches the law first",
    body: "Before writing a word, the engine retrieves the most relevant provisions from 5,800+ sections.",
  },
  {
    icon: LibraryBig,
    title: "Built for Nepal",
    body: "A language model fine-tuned on Nepali legal questions, paired with a search index of the codes themselves.",
  },
  {
    icon: Languages,
    title: "Plain language",
    body: "Statutory language explained clearly, so you can understand where you stand.",
  },
  {
    icon: MessagesSquare,
    title: "Your research, saved",
    body: "Sign in with Google and every conversation is kept, searchable and available on any device.",
  },
  {
    icon: Radio,
    title: "Written live",
    body: "Answers appear word by word, with clear progress while the engine searches.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Features"
        title="Legal research, made dependable."
        description="General chatbots guess. Nepal Law AI looks up the statute first, then explains it — and shows you where the answer comes from."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <article key={title} className="bg-card p-7">
            <span className="flex size-10 items-center justify-center rounded-md border border-brand/15 bg-brand-soft text-brand">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
