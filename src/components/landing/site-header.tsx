"use client";

import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthSession } from "@/hooks/use-auth-session";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#coverage", label: "Coverage" },
  { href: "#faq", label: "FAQ" },
];

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(subscribeToScroll, () => window.scrollY > 8, () => false);
  const { user } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled && "shadow-soft",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <Button asChild className="h-9 rounded-md px-4">
              <Link href="/chat/new">
                Open app <ArrowRight />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden h-9 rounded-md px-4 sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="h-9 rounded-md px-4">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined} className="bg-background p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo />
              <nav aria-label="Mobile" className="mt-10 flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 font-serif text-xl transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                {user ? (
                  <Button asChild className="h-11 rounded-full">
                    <Link href="/chat/new">Open app</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="h-11 rounded-full">
                      <Link href="/signup">Get started — it&apos;s free</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 rounded-full">
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
