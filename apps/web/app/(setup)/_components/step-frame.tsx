"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { StepFrame as StepFrameView, type StepFrameProps as StepFrameViewProps } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";
import { setupRoute, todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY, SETUP_TOTAL_STEPS } from "./copy";

/**
 * Which of the frame's four controls started the move — the one that shows
 * pending. `other` is a move from inside the content (a radio, a link) that
 * none of the four reflects; the skeleton still shows.
 */
export type StepAction = "primary" | "skip" | "back" | "finishLater" | "other";

type StepGo = (nextStep: number | null, path: string, action?: StepAction) => Promise<void>;

const StepNavigationContext = React.createContext<{ go: StepGo; pending: StepAction | null } | null>(null);

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
 *
 * THE TAP SHOWS PENDING (UX v1.3 R63, §2 guardrail 6; DAY-2). Inside the
 * sequence the move runs through `StepNavigationProvider`: one transition
 * for the screen, and the `action` that started it, so the tapped control —
 * the primary, *Skip for now*, *Back* or *Finish later* — shows pending
 * until the route's `loading.tsx` skeleton (or the screen) arrives. Outside
 * the sequence (Settings → Your day mounts the same screens) there is no
 * provider and the move is a plain replace.
 */
export function useStepNavigation(): StepGo {
  const context = React.useContext(StepNavigationContext);
  const router = useRouter();
  const save = trpc.user.updatePreferences.useMutation();

  const plain = React.useCallback<StepGo>(
    async (nextStep, path) => {
      try {
        await save.mutateAsync({ firstRunStep: nextStep });
      } catch {
        // Deliberately swallowed — see above.
      }
      router.replace(path);
    },
    [router, save],
  );

  return context?.go ?? plain;
}

/** The control whose move is out, or null — read by the frame. */
export function useStepPending(): StepAction | null {
  return React.useContext(StepNavigationContext)?.pending ?? null;
}

/** The sequence's one navigation: the write, then the replace inside a transition. */
export function StepNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const save = trpc.user.updatePreferences.useMutation();
  const [transitioning, startTransition] = React.useTransition();
  const [saving, setSaving] = React.useState(false);
  const [action, setAction] = React.useState<StepAction | null>(null);

  const go = React.useCallback<StepGo>(
    async (nextStep, path, tapped = "primary") => {
      setAction(tapped);
      setSaving(true);
      try {
        await save.mutateAsync({ firstRunStep: nextStep });
      } catch {
        // Deliberately swallowed — see `useStepNavigation`.
      } finally {
        setSaving(false);
      }
      startTransition(() => router.replace(path));
    },
    [router, save],
  );

  const value = React.useMemo(
    () => ({ go, pending: saving || transitioning ? action : null }),
    [action, go, saving, transitioning],
  );

  return <StepNavigationContext.Provider value={value}>{children}</StepNavigationContext.Provider>;
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
  backOnActionRow = false,
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
  /** UX v1.3 §4 (DAY-9): *Back* on the action row too — the builder's screens. */
  backOnActionRow?: boolean;
}) {
  const online = useOnline();
  const goTo = useStepNavigation();
  const pending = useStepPending();

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
      // The tapped control shows pending while the next screen loads (R63).
      primary={{ ...primary, busy: primary.busy === true || pending === "primary" }}
      skip={skip === undefined ? undefined : { ...skip, busy: skip.busy === true || pending === "skip" }}
      pending={pending === "back" || pending === "finishLater" ? pending : null}
      error={error}
      offline={!online}
      onBack={onBack ?? (step > 1 ? () => void goTo(step - 1, setupRoute(step - 1), "back") : undefined)}
      onFinishLater={() => void goTo(step, todayRoute(), "finishLater")}
      copy={copy}
      caption={caption}
      backOnActionRow={backOnActionRow}
    >
      {children}
    </StepFrameView>
  );
}
