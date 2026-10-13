"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-12 rounded-[30%]" />
      <h1 className="mt-8 font-serif text-5xl tracking-tight">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        An unexpected error interrupted this page. Trying again usually fixes it.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => retry()} className="h-11 rounded-md px-6">
          <RotateCcw /> Try again
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-md px-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
