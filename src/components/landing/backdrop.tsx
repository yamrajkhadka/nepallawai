/** Decorative hero background: grid, soft crimson/navy light and paper grain. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_20%,transparent_80%)]" />
      <div className="absolute top-[-14rem] left-1/2 h-[38rem] w-[min(68rem,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-[0.13] blur-3xl dark:opacity-[0.22]" />
      <div className="absolute top-[18rem] right-[-12rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.45_0.15_262),transparent)] opacity-[0.09] blur-3xl dark:opacity-25" />
      <div className="absolute top-[24rem] left-[-14rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-[0.06] blur-3xl dark:opacity-15" />
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen" />
    </div>
  );
}
