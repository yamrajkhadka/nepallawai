import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-[1.12] text-balance">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{description}</p>
      )}
    </div>
  );
}
