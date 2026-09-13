"use client";

import * as React from "react";

import { Button, Heading, HelperText, Text } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";
import { setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame, useStepNavigation } from "./step-frame";

/**
 * One screen, two frames — UX v1.1 §4 and §4.14.
 *
 * Every first-run screen captures one fact. In the sequence it sits in the
 * `StepFrame` and *Continue* writes then moves on; under Settings → Your day
 * it is the same screen "without the frame" — a heading, the content, and a
 * *Save* that writes the same fields and hands back. One component per fact,
 * this wrapper decides the frame, so the screens cannot drift between the
 * two homes.
 *
 * THE WRITE IS THE SCREEN'S; THE MOVE IS THIS WRAPPER'S. A screen hands over
 * `save()` — the one `updatePreferences` call for its fact — and the wrapper
 * sequences save, then step. A screen that writes nothing on *Continue*
 * (fixtures, screen 4) hands over `null`. *Skip for now* never writes.
 */

export interface FactScreenProps {
  step: number;
  heading: string;
  body?: string;
  children: React.ReactNode;
  /** The screen's write; null when *Continue* has nothing to save. */
  save: (() => Promise<void>) | null;
  /** The primary's label when it is not *Continue* (`Continue · 6 habits`). */
  primaryLabel?: string;
  /** The one gate: screen 3's radio (§4.3). */
  disabled?: boolean;
  /** Every screen after the first is skippable (§4). */
  skippable?: boolean;
  /** Settings → Your day: no frame, a *Save* primary. */
  embedded?: boolean;
  onSaved?: () => void;
}

export function FactScreen({
  step,
  heading,
  body,
  children,
  save,
  primaryLabel,
  disabled = false,
  skippable = true,
  embedded = false,
  onSaved,
}: FactScreenProps) {
  const online = useOnline();
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function persist(): Promise<boolean> {
    setError(null);
    if (save === null) return true;
    setBusy(true);
    try {
      await save();
      await utils.user.me.invalidate();
      return true;
    } catch {
      setError(COPY.saveError);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onContinue(): Promise<void> {
    if (!(await persist())) return;
    if (embedded) {
      onSaved?.();
      return;
    }
    await goTo(step + 1, setupRoute(step + 1));
  }

  if (embedded) {
    return (
      <div className="flex flex-col gap-(--space-5)">
        <Heading tabIndex={-1}>{heading}</Heading>
        {body === undefined ? null : (
          <Text as="p" tone="secondary">
            {body}
          </Text>
        )}
        {children}
        {error ? <HelperText error>{error}</HelperText> : null}
        {!online ? <HelperText>{COPY.offline}</HelperText> : null}
        <div className="flex justify-end">
          <Button
            busy={busy}
            disabled={!online || disabled}
            onClick={() => void onContinue()}
          >
            {COPY.save}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StepFrame
      step={step}
      heading={heading}
      body={body}
      error={error}
      primary={{
        label: primaryLabel ?? COPY.continue,
        onClick: () => void onContinue(),
        busy,
        disabled,
      }}
      skip={
        skippable
          ? { onSkip: () => void goTo(step + 1, setupRoute(step + 1)) }
          : undefined
      }
    >
      {children}
    </StepFrame>
  );
}
