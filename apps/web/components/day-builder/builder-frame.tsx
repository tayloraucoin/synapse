"use client";

import { ArrowLeft } from "lucide-react";
import * as React from "react";

import { Button, Heading, HelperText, Text, cn } from "@syn/ui";

import { StepFrame } from "@/app/(setup)/_components/step-frame";
import { useOnline } from "@/lib/hooks/use-online";

import { DAY_BUILDER_COPY as COPY } from "./copy";

/**
 * The builder's frame — UX v1.3 §4.4 (RUN-12; DAY-9).
 *
 * IN THE SEQUENCE it is screen 4's `StepFrame` (*4 of 5* under UX v1.3
 * §4.4; DAY-8 renumbered it from 13), *Finish later*, the sticky action
 * row) with a second caption under the progress line — *Day A · 3 of 17* —
 * and a back that walks the builder's screens rather than the outer five.
 * *Back* is on the action row's left too, beside the screen's own ghost
 * (*Not on this day*, *Skip for now*) and doing what the header arrow does
 * (v1.3 §4, the frame amended).
 * UNDER SETTINGS (`embedded`) there is no sequence: the same caption,
 * heading, body and action row, without the frame's chrome.
 *
 * FOCUS MOVES TO THE HEADING on every screen change (the outer frame only
 * does so on a step change, and the step stays 4). The caption is
 * `aria-live="polite"` so the change is read as well as seen.
 */
export function BuilderFrame({
  caption,
  heading,
  body,
  children,
  primary,
  skip,
  onBack,
  error,
  embedded = false,
  screenKey,
}: {
  caption: string;
  heading: string;
  body?: string;
  children?: React.ReactNode;
  primary: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
  skip?: { label: string; onSkip: () => void; busy?: boolean };
  onBack: () => void;
  error?: string | null;
  embedded?: boolean;
  /** Changes when the screen does; the heading takes focus. */
  screenKey: string;
}) {
  const online = useOnline();
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [screenKey]);

  if (!embedded) {
    return (
      <div ref={rootRef} className="contents">
        <StepFrame
          step={4}
          heading={heading}
          body={body}
          caption={caption}
          onBack={onBack}
          backOnActionRow
          primary={primary}
          skip={skip}
          error={error}
        >
          {children}
        </StepFrame>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col gap-(--space-5)">
      <div className="flex items-center gap-(--space-3)">
        <Button variant="ghost" size="icon" aria-label={COPY.back} className="shrink-0" onClick={onBack}>
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
        <Text as="span" variant="caption" tone="secondary" aria-live="polite" className="tabular-nums">
          {caption}
        </Text>
      </div>
      <Heading tabIndex={-1}>{heading}</Heading>
      {body === undefined ? null : (
        <Text as="p" tone="secondary">
          {body}
        </Text>
      )}
      {children}
      {error ? <HelperText error>{error}</HelperText> : null}
      {!online ? <HelperText>{COPY.offline}</HelperText> : null}
      <div
        data-step-actions
        className={cn(
          "mt-auto flex items-center justify-end gap-(--space-3)",
          "bg-paper border-hairline sticky bottom-0 z-10 -mx-(--space-4) border-t px-(--space-4) py-(--space-3) pb-[max(var(--space-3),env(safe-area-inset-bottom))]",
        )}
      >
        <Button variant="ghost" className="me-auto" onClick={onBack}>
          {COPY.back}
        </Button>
        {skip === undefined ? null : (
          <Button variant="ghost" busy={skip.busy} disabled={!online} onClick={skip.onSkip}>
            {skip.label}
          </Button>
        )}
        <Button busy={primary.busy} disabled={!online || primary.disabled} onClick={primary.onClick}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
