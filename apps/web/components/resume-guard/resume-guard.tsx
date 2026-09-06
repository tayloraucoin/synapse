"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { homeRoute } from "@/lib/routes";
import { isPWA } from "@/lib/pwa/install-detection";

/** Cross-cutting §5.2 — under an hour, stay put; over it, re-run the tree. */
const RESUME_THRESHOLD_MS = 60 * 60 * 1000;

/**
 * Standalone resume — cross-cutting §5.2.
 *
 * AN INSTALLED APP IS NEVER CLOSED, only backgrounded, which is the problem
 * this solves. Someone who put the app down last night and picks it up this
 * morning would otherwise return to yesterday's List — the right screen for the
 * moment they left and the wrong one for the moment they came back. Over an
 * hour away, `/` re-runs the entry tree (§4.2) and lands them wherever they
 * actually belong: today, or the setup step they owe, or verify.
 *
 * UNDER AN HOUR IT DOES NOTHING, and that is the more important half. Checking
 * a notification, answering a message and coming back is not a new session, and
 * an app that reset the screen every time would lose someone's place mid-task
 * several times an hour.
 *
 * STANDALONE ONLY. A browser tab has its own history and its own expectations —
 * a tab that silently navigated itself while you were reading something else
 * would be the page taking a liberty. The document scopes this to the installed
 * app and so does the guard.
 *
 * `hiddenAt` IS IN MEMORY, deliberately. A reload resets it, which is correct:
 * a reload has already re-run the tree.
 */
export function ResumeGuard() {
  const router = useRouter();

  React.useEffect(() => {
    if (!isPWA()) return;

    let hiddenAt: number | null = null;

    function onVisibilityChange(): void {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }

      if (hiddenAt === null) return;
      const away = Date.now() - hiddenAt;
      hiddenAt = null;

      if (away > RESUME_THRESHOLD_MS) {
        // `/` is the entry tree, never a rendered screen — it resolves and
        // redirects (§4.2). `replace` so back does not walk into it.
        router.replace(homeRoute());
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [router]);

  return null;
}
