"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Text } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";
import { settingsWeekRoute, todayRoute } from "@/lib/routes";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame } from "./step-frame";

/**
 * Screen 13 — *Your days*, as a PLACEHOLDER (UX v1.2 §4.13; RUN-8).
 *
 * v1.2 makes screen 13 the day builder (RUN-12) and moves first run's
 * completion to screen 14 (RUN-13). Until those ship, this screen is where
 * the sequence ends: the fit screen v1.1 put here (§4.12, DYN-11) is gone —
 * its number and its three modes were what v1.2 §0.4 retired — and what
 * stays is the one thing the sequence must never lose, the way out.
 * *Open today* and *Plan this week first* both call `completeFirstRun`, so
 * a person who reaches 13 finishes first run rather than meeting a wall.
 *
 * NOTHING ELSE. No strip, no question, no number; a placeholder that
 * explained itself would be a screen someone had to design twice.
 */
export function Step13Days() {
  const router = useRouter();
  const complete = trpc.user.completeFirstRun.useMutation();
  const [error, setError] = React.useState<string | null>(null);

  async function finish(then: string): Promise<void> {
    setError(null);
    try {
      await complete.mutateAsync({});
      router.replace(then);
    } catch {
      setError(COPY.saveError);
    }
  }

  return (
    <StepFrame
      step={13}
      heading={COPY.step13Heading}
      error={error}
      primary={{
        label: COPY.openToday,
        onClick: () => void finish(todayRoute()),
        busy: complete.isPending,
      }}
      skip={{
        label: COPY.planWeekFirst,
        onSkip: () => void finish(settingsWeekRoute()),
        busy: complete.isPending,
      }}
    >
      <Text as="p" tone="secondary">
        {COPY.step13Placeholder}
      </Text>
    </StepFrame>
  );
}
