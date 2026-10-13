"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { track } from "@/lib/analytics";
import { stashQuestion } from "@/lib/pending-question";
import { getSupabase } from "@/lib/supabase";

/**
 * Send a visitor to the chat with their question. Signed-out visitors go via
 * sign-in first; the question waits in storage and is asked automatically after.
 */
export function useAsk() {
  const router = useRouter();

  return useCallback(
    async (question: string | undefined, source: string) => {
      const clean = question?.trim();
      if (clean) stashQuestion(clean);
      track("landing_ask", { source, has_question: Boolean(clean) });

      let signedIn = false;
      try {
        signedIn = Boolean((await getSupabase().auth.getSession()).data.session);
      } catch {
        // Not configured locally — fall through to sign-in.
      }
      router.push(signedIn ? "/chat/new" : "/login");
    },
    [router],
  );
}
