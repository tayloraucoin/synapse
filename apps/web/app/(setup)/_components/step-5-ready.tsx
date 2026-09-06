"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { forgetSetupTemplateId } from "./setup-template-id";
import { StepFrame } from "./step-frame";

/**
 * FR-05 — the handover, and the only screen that says where everything lives.
 *
 * COMPLETION IS MARKED ON *OPEN TODAY*, NOT ON ARRIVAL (Epic 1 FR-05). Someone
 * who reloads this screen should still see it; writing `first_run_completed_at`
 * when it renders would replace *Your list is ready* with a redirect to a list
 * they have not asked for yet, and there would be no way back to read the
 * sentence they were in the middle of.
 *
 * THE BODY IS CHOSEN BY WHAT ACTUALLY HAPPENED, in the document's order:
 * planned days first, then habits without a plan, then nothing. The third
 * sentence is not a failure message — nothing was required at any step, so
 * arriving here having done none of it is a supported path, and it reads like
 * one.
 */
export function Step5Ready({
  plannedDays,
  habitCount,
}: {
  plannedDays: number;
  habitCount: number;
}) {
  const router = useRouter();
  const complete = trpc.user.completeFirstRun.useMutation();
  const [error, setError] = React.useState<string | null>(null);

  const body =
    plannedDays > 0
      ? COPY.readyWithPlan(plannedDays)
      : habitCount > 0
        ? COPY.readyWithHabits
        : COPY.readyWithNothing;

  async function openToday(): Promise<void> {
    setError(null);
    try {
      await complete.mutateAsync();
    } catch {
      setError(COPY.saveError);
      return;
    }
    forgetSetupTemplateId();
    router.replace(todayRoute());
  }

  return (
    <StepFrame
      step={5}
      heading={COPY.step5Heading}
      body={body}
      error={error}
      primary={{
        label: COPY.openToday,
        onClick: () => void openToday(),
        busy: complete.isPending,
      }}
    />
  );
}
