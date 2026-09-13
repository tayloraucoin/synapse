"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame } from "./step-frame";

/**
 * The transitional ready screen — DYN-10 only; DYN-11 replaces it with
 * screens 7–12 and moves completion to screen 12.
 *
 * Screen 6's *Continue* has to land somewhere that renders: a sequence that
 * ends on a step that does not exist is the dead end the ticket names. This
 * is the v1.0 handover (FR-05) re-homed: it completes first run on *Open
 * today*, not on arrival, so a reload still shows the sentence.
 */
export function Step7Ready() {
  const router = useRouter();
  const complete = trpc.user.completeFirstRun.useMutation();
  const [error, setError] = React.useState<string | null>(null);

  async function openToday(): Promise<void> {
    setError(null);
    try {
      await complete.mutateAsync();
    } catch {
      setError(COPY.saveError);
      return;
    }
    router.replace(todayRoute());
  }

  return (
    <StepFrame
      step={7}
      heading={COPY.readyHeading}
      body={COPY.readyBody}
      error={error}
      primary={{
        label: COPY.openToday,
        onClick: () => void openToday(),
        busy: complete.isPending,
      }}
    />
  );
}
