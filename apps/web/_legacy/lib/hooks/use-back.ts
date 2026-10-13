"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useShell } from "@/app/(shell)/_components/shell-context";

/**
 * A back affordance that never leaves the app.
 *
 * `router.back()` is right whenever there is somewhere in-app to go back to.
 * When there is not — the person opened `/settings/habits` from a link, a
 * notification, or a fresh tab — `back()` would take them out of Synapse
 * entirely, which is a trapdoor rather than a back button. The fallback is a
 * `replace` to the sensible parent, so the history does not grow a loop.
 *
 * The depth comes from the shell context, which counts in-app navigations for
 * this session.
 */
export function useBack(fallback: string): () => void {
  const router = useRouter();
  const { depth } = useShell();

  return useCallback(() => {
    if (depth > 0) {
      router.back();
      return;
    }
    router.replace(fallback);
  }, [depth, fallback, router]);
}
