import { ArrowRight, BookOpenCheck, Check } from "lucide-react";
import { AskBox } from "@/components/landing/ask-box";
import { Coverage } from "@/components/landing/coverage";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductPreview } from "@/components/landing/product-preview";
import { SectionHeading } from "@/components/landing/section-heading";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Stats } from "@/components/landing/stats";
import { faqs, legalCodes, siteConfig } from "@/lib/site";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Web",
    inLanguage: "en",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
    creator: { "@type": "Person", name: siteConfig.author },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

const promises = ["Free to use", "Cites the exact section", "Saves your research"];

export default function LandingPage() {
  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_30%,transparent_80%)]"
          />
          <div
            aria-hidden
            className="absolute top-[-14rem] left-1/2 h-[32rem] w-[56rem] max-w-[150%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-[0.12] blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20">
            <a
              href="#coverage"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft transition-colors hover:text-foreground sm:text-sm"
            >
              <span className="size-1.5 rounded-full bg-brand" />
              {siteConfig.provisionCount} provisions of Nepali law, searchable
              <ArrowRight className="size-3.5" />
            </a>
            <h1 className="mx-auto mt-7 max-w-3xl font-serif text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.08] text-balance">
              Legal answers for Nepal, <span className="text-brand">with the exact section cited.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Ask in plain language. Nepal Law AI searches the Constitution and the National Civil and Penal Codes,
              then explains the answer and cites the Act, chapter and section.
            </p>
            <div className="mx-auto mt-9 max-w-2xl text-left">
              <AskBox />
            </div>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand" strokeWidth={2.5} /> {promise}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto grid max-w-5xl gap-3 px-4 pb-16 sm:grid-cols-3 sm:px-6 sm:pb-20">
            {legalCodes.map((code) => (
              <div key={code.id} className="rounded-xl border border-border bg-card p-5 text-left shadow-soft">
                <div className="flex items-center justify-between">
                  <BookOpenCheck className="size-5 text-brand" />
                  <span className="font-mono text-xs text-muted-foreground">{code.year}</span>
                </div>
                <p className="mt-4 font-semibold">{code.name}</p>
                <p lang="ne" className="mt-0.5 text-sm text-muted-foreground">
                  {code.nepali}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Stats />

        <section className="border-b border-border bg-muted/40 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Example"
              title="A cited answer, in plain language."
              description="A real response from the engine: the governing provision first, then the explanation."
            />
            <div className="mx-auto mt-12 max-w-5xl">
              <ProductPreview />
            </div>
          </div>
        </section>

        <Features />
        <HowItWorks />
        <Coverage />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </>
  );
}
