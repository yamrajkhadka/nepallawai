import { Scale } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The § glyph from Instrument Serif, centred in a 32×32 box. Shared with app/icon.svg. */
const SECTION_SIGN =
  "M15.03 26.5Q14.5 26.5 14.01 26.39Q13.52 26.28 13.13 26.04Q12.88 25.86 12.88 25.64L12.83 22.96Q12.83 22.59 13.15 22.59Q13.35 22.59 13.42 22.7Q13.49 22.81 13.54 22.98Q14.08 24.57 14.61 25.19Q15.13 25.82 15.87 25.82Q16.57 25.82 17.04 25.38Q17.5 24.94 17.5 24.28Q17.5 23.69 17.28 23.14Q17.06 22.59 16.54 21.93Q16.01 21.27 15.03 20.36Q13.67 19.07 12.97 17.96Q12.27 16.84 12.27 15.65Q12.27 14.35 12.99 13.47Q13.71 12.59 14.84 12.32Q15.21 12.25 14.96 11.95Q14.08 11.03 13.62 10.18Q13.15 9.34 13.15 8.46Q13.15 7.11 14.17 6.31Q15.18 5.5 16.97 5.5Q17.5 5.5 17.99 5.61Q18.48 5.72 18.87 5.96Q19.12 6.14 19.12 6.36L19.17 9.04Q19.17 9.41 18.85 9.41Q18.68 9.41 18.59 9.3Q18.51 9.19 18.46 9.02Q17.92 7.43 17.39 6.81Q16.87 6.18 16.13 6.18Q15.45 6.18 14.97 6.62Q14.5 7.06 14.5 7.72Q14.5 8.29 14.72 8.85Q14.94 9.41 15.47 10.07Q16.01 10.73 16.97 11.64Q18.33 12.93 19.03 14.04Q19.73 15.16 19.73 16.35Q19.73 17.65 19.01 18.53Q18.29 19.41 17.16 19.68Q16.79 19.75 17.04 20.05Q17.92 20.97 18.38 21.82Q18.85 22.66 18.85 23.54Q18.85 24.89 17.85 25.69Q16.84 26.5 15.03 26.5ZM16.62 19.14Q17.43 19.02 17.91 18.48Q18.38 17.94 18.38 17.09Q18.38 16.16 17.87 15.27Q17.36 14.37 16.13 13.15Q15.82 12.79 15.38 12.86Q14.55 12.98 14.08 13.52Q13.62 14.06 13.62 14.91Q13.62 15.82 14.14 16.72Q14.67 17.63 15.87 18.85Q16.18 19.21 16.62 19.14Z";

/** `decorative` drops the thickening stroke, which would double up where a translucent glyph overlaps itself. */
export function SectionGlyph({ className, decorative }: { className?: string; decorative?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <path
        d={SECTION_SIGN}
        fill="currentColor"
        stroke={decorative ? "none" : "currentColor"}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[26%] bg-linear-to-br from-[#3b6cf6] to-[#1d3fd1] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_2px_rgb(0_0_0/0.18)]",
        className,
      )}
    >
      <Scale className="size-[58%]" strokeWidth={2} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-[1.15rem] leading-none font-semibold tracking-tight whitespace-nowrap", className)}>
      Nepal Law <span className="text-brand">AI</span>
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Nepal Law AI — home"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg outline-offset-4", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <Wordmark />
    </Link>
  );
}
