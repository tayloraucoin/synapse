import Link from "next/link";

import { Button, Heading, Text } from "@syn/ui";

import { todayRoute } from "@/lib/routes";

/**
 * SY-05 — route not found (cross-cutting §10).
 *
 * Never a stack trace, never an error code in the copy. The code is logged;
 * the person gets a sentence and a door.
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-sm flex-col justify-center gap-(--space-4) p-(--space-4)"
    >
      <Heading>This page isn&apos;t here.</Heading>
      <Text as="p" tone="body">
        The link may be old, or the day it points to hasn&apos;t been planned.
      </Text>
      <Button asChild className="self-start">
        <Link href={todayRoute()}>Open today</Link>
      </Button>
    </main>
  );
}
