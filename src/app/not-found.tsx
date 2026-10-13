import { ArrowLeft, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Backdrop } from "@/components/landing/backdrop";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center px-6 py-8 text-center">
      <Backdrop />
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center py-16">
        <p className="font-mono text-sm tracking-widest text-brand">§ 404</p>
        <h1 className="mt-4 max-w-2xl font-serif text-[clamp(2.75rem,8vw,5rem)] leading-[1] tracking-tight text-balance">
          This section <span className="text-brand">doesn&apos;t exist.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">
          The page you&apos;re looking for was repealed, renumbered — or never enacted.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-md px-6">
            <Link href="/">
              <ArrowLeft /> Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-md px-6">
            <Link href="/chat/new">
              <MessageSquare /> Ask a legal question
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
