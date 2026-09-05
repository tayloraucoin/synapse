"use client";

import * as React from "react";
import Link from "next/link";

import { createLogger } from "@syn/observability";
import { Button, Heading, Text } from "@syn/ui";

import { todayRoute } from "@/lib/routes";

const log = createLogger("web/error");

/**
 * SY-05 — an unrecoverable client error (cross-cutting §10).
 *
 * "Your changes are kept" is a promise, not a platitude: the local-first
 * writes survive a re-render, and the copy says so because the first thing a
 * person wonders after an error is whether they lost something.
 *
 * The digest is logged, never shown. An error code on screen asks a person to
 * do support's job.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    log.log("render error", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-sm flex-col justify-center gap-(--space-4) p-(--space-4)"
    >
      <Heading>Something went wrong on this screen.</Heading>
      <Text as="p" tone="body">
        Your changes are kept.
      </Text>
      <div className="flex gap-(--space-3)">
        <Button onClick={reset}>Reload</Button>
        <Button variant="secondary" asChild>
          <Link href={todayRoute()}>Open today</Link>
        </Button>
      </div>
    </main>
  );
}
