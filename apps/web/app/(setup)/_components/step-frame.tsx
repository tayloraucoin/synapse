"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { StepFrame as StepFrameView, type StepFrameProps as StepFrameViewProps } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";
import { setupRoute, todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY, SETUP_TOTAL_STEPS } from "./copy";

/**
 * Move to another step, recording it on the account first.
 *
 * EVERY TRANSITION WRITES `first_run_step`. Continue, Skip, back and *Finish
 * later* all come through here, so resuming works from a reload, a second
 * device, or a cold open three days later. Progress kept only in the browser
 * is progress lost the first time someone switches phones.
 *
 * A FAILED WRITE STILL NAVIGATES. Trapping a person in a wizard because a
 * bookkeeping update failed is worse than resuming them a step early — and
 * the step they land on is one they have already seen.
 *
 * It is a hook rather than a prop on `StepFrame` because the steps that write
 * something of their own — FR-01's preferences, FR-05's completion — must
 * sequence that write before the move, and they need the same function.
 */
export function useStepNavigation() {
  const router = useRouter();
  const save = trpc.user.updatePreferences.useMutation();

  return React.useCallback(
    async (nextStep: number | null, path: string): Promise<void> => {
      try {
        await save.mutateAsync({ firstRunStep: nextStep });
      } catch {
        // Deliberately swallowed — see above.
      }
      router.replace(path);
    },
    [router, save],
  );
}

/**
 * The frame every first-run step shares — Epic 1 §2, bound to this app.
 *
 * THE FRAME ITSELF LIVES IN `@syn/ui` (DYN-7): Settings → Your day reuses
 * the same screens without the sequence (UX v1.1 §4), so the frame takes
 * callbacks and this file supplies them — the step navigation, the online
 * hook, the routes, and the copy. The five v1.0 steps render through here
 * unchanged.
 */
export function StepFrame({
  step,
  heading,
  body,
  children,
  skip,
  primary,
  error,
  caption,
  onBack,
}: {
  step: number;
  heading: string;
  body?: string;
  children?: React.ReactNode;
  /** Every screen after the first (UX v1.1 §4). */
  skip?: { label?: string; onSkip: () => void; busy?: boolean };
  primary: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
  error?: string | null;
  /** The day builder's *Day A · 3 of 9* (v1.2 §4.13, RUN-12). */
  caption?: React.ReactNode;
  /** A screen with sub-screens owns its back; the sequence's is the default. */
  onBack?: () => void;
}) {
  const online = useOnline();
  const goTo = useStepNavigation();

  const copy: StepFrameViewProps["copy"] = React.useMemo(
    () => ({
      progress: (current, total) => COPY.progress(current, total),
      back: COPY.back,
      finishLater: COPY.finishLater,
      skip: COPY.skip,
      offline: COPY.offline,
    }),
    [],
  );

  return (
    <StepFrameView
      step={step}
      total={SETUP_TOTAL_STEPS}
      heading={heading}
      body={body}
      primary={primary}
      skip={skip}
      error={error}
      offline={!online}
      onBack={onBack ?? (step > 1 ? () => void goTo(step - 1, setupRoute(step - 1)) : undefined)}
      onFinishLater={() => void goTo(step, todayRoute())}
      copy={copy}
      caption={caption}
    >
      {children}
    </StepFrameView>
  );
}
