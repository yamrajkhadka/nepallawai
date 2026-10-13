"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/** Lightweight "who's signed in?" for public pages. */
export function useAuthSession() {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data }) => {
        if (active) setState({ user: data.session?.user ?? null, ready: true });
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setState({ user: session?.user ?? null, ready: true });
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // Supabase isn't configured (e.g. local preview without env vars): treat as signed out.
      queueMicrotask(() => active && setState({ user: null, ready: true }));
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

export function firstName(user: User | null): string | null {
  const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const full = meta?.full_name ?? meta?.name;
  return full?.trim().split(/\s+/)[0] ?? null;
}
