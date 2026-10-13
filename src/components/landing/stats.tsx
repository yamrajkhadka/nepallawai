import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const stats = [
  { value: siteConfig.provisionCount, label: "legal provisions indexed" },
  { value: "3", label: "foundational codes covered" },
  { value: "§", label: "section cited with every answer" },
  { value: "Free", label: "no subscription, no card" },
];

export function Stats() {
  return (
    <section aria-label="At a glance" className="border-y border-border bg-card/50">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center gap-1 border-border px-4 py-10 text-center",
              index % 2 === 1 && "border-l",
              index === 2 && "md:border-l",
              index >= 2 && "border-t md:border-t-0",
            )}
          >
            <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="order-1 font-serif text-5xl tracking-tight">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
