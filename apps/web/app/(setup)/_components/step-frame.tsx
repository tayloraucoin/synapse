"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button, Heading, HelperText, Text } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";
import { setupRoute, todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

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
 * The frame every first-run step shares — Epic 1 §2.
 *
 * BACK NEVER LEAVES THE SEQUENCE (cross-cutting §1.3). In a sequence, back
 * means the previous step; *Finish later* is the exit. Two intentions, two
 * controls — giving them one would make leaving accidental.
 *
 * IT ADDS NO `main`. The setup layout already renders one, and a second would
 * give the sequence two main landmarks and the skip link an ambiguous target.
 *
 * FOCUS MOVES TO THE HEADING ON EVERY STEP CHANGE, found by querying rather
 * than by a ref, exactly as `PageFrame` does: a sequence advancing in place is
 * not a page load, so nothing would announce the new step otherwise.
 */
export function StepFrame({
  step,
  heading,
  body,
  children,
  skip,
  primary,
  error,
}: {
  step: number;
  heading: string;
  body?: string;
  children?: React.ReactNode;
  /** Steps 3 and 4 only (Epic 1 §2). */
  skip?: { label?: string; onSkip: () => void; busy?: boolean };
  primary: { label: string; onClick: () => void; busy?: boolean };
  error?: string | null;
}) {
  const online = useOnline();
  const goTo = useStepNavigation();
  const frameRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    frameRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [step]);

  return (
    <div ref={frameRef} className="flex min-h-0 flex-1 flex-col gap-(--space-5)">
      <div className="flex items-center gap-(--space-3)">
        {step > 1 ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={COPY.back}
            className="shrink-0"
            onClick={() => void goTo(step - 1, setupRoute(step - 1))}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
        <Text as="span" variant="caption" tone="secondary">
          {COPY.progress(step)}
        </Text>
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => void goTo(step, todayRoute())}
        >
          {COPY.finishLater}
        </Button>
      </div>

      {/*
       * `tabIndex={-1}` so the step change can move focus here without adding
       * the heading to the tab order (cross-cutting §3.4).
       */}
      <Heading tabIndex={-1}>{heading}</Heading>

      {body === undefined ? null : (
        <Text as="p" tone="secondary">
          {body}
        </Text>
      )}

      {children}

      {error ? <HelperText error>{error}</HelperText> : null}
      {!online ? <HelperText>{COPY.offline}</HelperText> : null}

      {/* The actions are last in the DOM as well as on the screen (§2). */}
      <div className="mt-auto flex items-center justify-end gap-(--space-3)">
        {skip === undefined ? null : (
          <Button
            variant="secondary"
            busy={skip.busy}
            disabled={!online}
            onClick={skip.onSkip}
          >
            {skip.label ?? COPY.skip}
          </Button>
        )}
        <Button
          busy={primary.busy}
          disabled={!online}
          onClick={primary.onClick}
        >
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
