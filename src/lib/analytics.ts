export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-RG6WNG38TK";

type Gtag = (command: "event", name: string, params?: Record<string, string | number | boolean>) => void;

/** Send a GA4 event. A no-op until the gtag script has loaded (or if it's blocked). */
export function track(event: string, params?: Record<string, string | number | boolean>) {
  const gtag = (window as typeof window & { gtag?: Gtag }).gtag;
  gtag?.("event", event, params);
}
