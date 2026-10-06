"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { createLogger } from "@syn/observability";
import { ErrorPage } from "@syn/ui";

import { todayRoute } from "@/lib/routes";

const log = createLogger("web/error");

/**
 * SY-05 — an unrecoverable client error (cross-cutting §10).
 *
 * "Your changes are kept" is a promise, not a platitude: the local-first
 * writes survive a re-render, and the copy says so because the first thing a
 * person wonders after an error is whether they lost something. The sentence
 * lives in `ErrorPage` with its sibling variant's.
 *
 * THE DIGEST IS LOGGED, NEVER SHOWN. An error code on screen asks a person to
 * do support's job — and the message is logged rather than rendered for the
 * same reason: a thrown `Error` can carry a title, a note, or an id in its
 * text, and this screen is not the place any of that surfaces.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  React.useEffect(() => {
    log.log("render error", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-sm flex-col justify-center"
    >
      <ErrorPage
        variant="unrecoverable"
        onReload={reset}
        onOpenToday={() => router.push(todayRoute())}
      />
    </main>
  );
}
