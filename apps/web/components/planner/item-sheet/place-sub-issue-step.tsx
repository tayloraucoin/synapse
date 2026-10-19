"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import { Button, Text } from "@syn/ui";
import { TierField } from "@/components/work/add/new-task/fields";
import { DayPick, type DayPickChip } from "@/components/work/day-pick";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.dayStep;

/**
 * PlaceSubIssueStep — one day, one tier, the consequence, the action
 * (USE-67; sub-issue-alone.md): "Sub-issue of SYN-212 · <issue>" over
 * "Place <title>", the line that it stays checkable under its issue, Day
 * (DayPick, days with no Work block greyed), Tier (each segment its square
 * and word), "Thu's Secondary runs to 11:20 at the top of its ranges." and
 * "Place on Thu 15" in ink. Add a day is the same step with its own words
 * [ASSUMPTION: not drawn]. The line is said politely when it changes. A step
 * inside the Item sheet; × or a swipe down leaves without placing. Props only.
 */
export interface PlaceSubIssueStepProps {
  /** "Sub-issue of SYN-212 · …"; absent on Add a day. */
  scope?: React.ReactNode;
  title: string;
  lead: string;
  chips: readonly DayPickChip[];
  day: string | null;
  onDay: (dateKey: string) => void;
  tier: WorkTier;
  onTier: (tier: WorkTier) => void;
  /** The consequence, in words, never red. */
  line: string;
  /** "Place on Thu 15", "Add Fri 16". */
  action: string;
  canAct: boolean;
  onAct: () => void;
  headingRef: React.Ref<HTMLHeadingElement>;
}

export function PlaceSubIssueStep({
  scope,
  title,
  lead,
  chips,
  day,
  onDay,
  tier,
  onTier,
  line,
  action,
  canAct,
  onAct,
  headingRef,
}: PlaceSubIssueStepProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canAct) onAct();
      }}
      className="flex flex-col gap-(--space-4)"
    >
      <div className="flex flex-col gap-(--space-1)">
        {scope === undefined ? null : (
          <Text
            as="p"
            variant="caption"
            tone="secondary"
            className="flex items-center gap-(--space-1)"
          >
            {scope}
          </Text>
        )}
        <Text
          ref={headingRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {title}
        </Text>
        <Text as="p" variant="secondary" tone="secondary">
          {lead}
        </Text>
      </div>
      <DayPick label={COPY.day} chips={chips} value={day} onChange={onDay} />
      <TierField value={tier} onChange={onTier} />
      <Text as="p" variant="secondary" tone="secondary" aria-live="polite">
        {line}
      </Text>
      <Button type="submit" size="lg" disabled={!canAct} className="w-full">
        {action}
      </Button>
    </form>
  );
}
