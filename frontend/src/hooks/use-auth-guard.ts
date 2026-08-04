"use client";

import { useSessionQuery } from "@/hooks/use-chat-data";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook that guards a route — redirects to /login if no session.
 * Returns the session data, loading state, and error.
 */
export function useAuthGuard() {
  const { data: session, isLoading: isPending, error } = useSessionQuery();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  return { session, isPending, error };
}
