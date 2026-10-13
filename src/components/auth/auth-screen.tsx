"use client";

import { AlertCircle, ArrowLeft, BookOpenCheck, History, LoaderCircle, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Logo, LogoMark, SectionGlyph } from "@/components/brand/logo";
import { CitationCard } from "@/components/chat/citation-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { track } from "@/lib/analytics";
import { wakeEngine } from "@/lib/legal-engine";
import { peekQuestion } from "@/lib/pending-question";
import { getSupabase } from "@/lib/supabase";
import { GoogleIcon } from "./google-icon";

type Mode = "login" | "signup";

const copy: Record<Mode, { title: string; subtitle: string; switchText: string; switchLabel: string; switchHref: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to pick up your legal research where you left off.",
    switchText: "New to Nepal Law AI?",
    switchLabel: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "Free, one click with Google — and every question you ask is saved for later.",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
};

const noSubscribe = () => () => {};

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [redirecting, setRedirecting] = useState(false);
  // Client-only values, read without a hydration mismatch.
  const urlError = useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("error"),
    () => null,
  );
  const pendingQuestion = useSyncExternalStore(noSubscribe, peekQuestion, () => null);
  const text = copy[mode];

  useEffect(() => {
    wakeEngine();
  }, []);

  useEffect(() => {
    if (user) router.replace("/chat/new");
  }, [user, router]);

  const continueWithGoogle = async () => {
    setRedirecting(true);
    track("sign_in_start", { mode, with_question: Boolean(pendingQuestion) });
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat/new`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      setRedirecting(false);
      toast.error("Couldn't start Google sign-in", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <LogoMark className="mb-8 size-12 animate-fade-up rounded-md" />
          <h1 className="animate-fade-up font-serif text-[2.75rem] leading-[1.05] tracking-tight [animation-delay:60ms]">
            {pendingQuestion ? "One step to your answer" : text.title}
          </h1>
          <p className="mt-3 animate-fade-up leading-relaxed text-muted-foreground [animation-delay:120ms]">
            {pendingQuestion ? "Sign in with Google and we'll start answering right away:" : text.subtitle}
          </p>

          {pendingQuestion && (
            <figure className="mt-5 flex animate-fade-up gap-3 rounded-lg border border-border bg-card p-4 shadow-soft [animation-delay:160ms]">
              <Quote className="size-4 shrink-0 text-brand" />
              <blockquote className="line-clamp-4 text-sm leading-relaxed font-medium">{pendingQuestion}</blockquote>
            </figure>
          )}

          {urlError && (
            <div
              role="alert"
              className="mt-5 flex gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm"
            >
              <AlertCircle className="size-4 shrink-0 text-destructive" />
              <p>
                <span className="font-medium">Sign-in didn&apos;t finish.</span>{" "}
                <span className="text-muted-foreground">{urlError}</span>
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={continueWithGoogle}
            disabled={redirecting}
            className="mt-8 h-12 w-full animate-fade-up gap-3 rounded-xl bg-card text-[15px] font-medium shadow-soft [animation-delay:200ms] hover:bg-accent disabled:opacity-80"
          >
            {redirecting ? <LoaderCircle className="size-5 animate-spin" /> : <GoogleIcon className="size-5" />}
            {redirecting ? "Redirecting to Google…" : "Continue with Google"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {text.switchText}{" "}
            <Link href={text.switchHref} className="font-medium text-foreground underline-offset-4 hover:underline">
              {text.switchLabel}
            </Link>
          </p>
        </div>

        <p className="mx-auto max-w-sm pb-2 text-center text-xs leading-relaxed text-muted-foreground">
          We use your Google account only to sign you in and keep your research history. Nepal Law AI provides legal
          information, not legal advice.
        </p>
      </main>
    </div>
  );
}

const benefits = [
  { icon: BookOpenCheck, text: "Answers cite the Act, chapter and section" },
  { icon: Sparkles, text: "Plain language, written live as you watch" },
  { icon: History, text: "Every conversation saved and searchable" },
];

function BrandPanel() {
  return (
    <aside
      data-theme="dark"
      className="relative isolate hidden flex-col justify-between overflow-hidden bg-[#09090b] p-10 text-foreground lg:flex xl:p-14"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_70%)]" />
      <div
        aria-hidden
        className="absolute top-[-10rem] left-[-6rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute right-[-8rem] bottom-[-6rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.45_0.15_262),transparent)] opacity-40 blur-3xl"
      />
      <SectionGlyph decorative className="absolute -right-24 top-1/2 -z-10 size-[34rem] -translate-y-1/2 text-white/[0.025]" />

      <Logo />

      <div className="max-w-lg">
        <h2 className="font-serif text-[3.25rem] leading-[1.02] tracking-tight text-balance">
          The law of Nepal, <span className="text-brand">explained</span> — with the section to prove it.
        </h2>
        <div className="mt-10 max-w-md -rotate-1">
          <CitationCard
            citation={{
              law: "National Penal Code 2017",
              division: { label: "Chapter", value: "Offences Relating to Theft and Robbery" },
              provision: { label: "Section", number: "241", title: "Prohibition of theft" },
            }}
            className="shadow-elevated"
          />
        </div>
      </div>

      <ul className="grid gap-3 text-sm text-muted-foreground">
        {benefits.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <Icon className="size-4 text-brand" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
