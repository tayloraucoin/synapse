/**
 * DecisionPanel — one undone item, decided (v2 handoff §5.9).
 *
 * DR-02 and DR-05. Two 56px targets, then — if *Missed* — the tier chooser
 * inline. Habits show *Missed* alone at full width: a habit cannot be carried
 * to tomorrow, and offering the choice would make the person work out why it
 * does nothing.
 *
 * NO CARD, HAIRLINE ONLY. A day's review is a column of these, and fifteen
 * cards is a filing cabinet. The separation is a rule and 24px of air.
 *
 * `resolved-by-shift` items arrive already decided by the shift's reason; the
 * panel says so and still offers *Change*, because a reason given while
 * running late is a guess made under pressure.
 *
 * THE DECISION IS COMPLETE ONLY WHEN IT CAN BE. Tier 3 decides on selection;
 * tiers 1 and 2 need a reason chip; *Stayed on something more important* needs
 * the traded-up item. `onDecide` is called at exactly those moments and not
 * before, so a half-answered panel never writes a Miss.
 */
"use client";

import type {
  DayItemView,
  DecisionState,
  MissTier,
  ReasonView,
} from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Textarea } from "../../../primitives/control/textarea";
import { Text } from "../../../primitives/typography/text";
import { DecidedLine } from "../../display/decided-line";
import { ItemIcon } from "../../display/item-icon";
import { TimeText } from "../../display/time-text";
import { TextDisclosureButton } from "../text-disclosure-button";
import { OTHER_REASON_KEY } from "../reason-chips";
import { TierRadioRows } from "../tier-radio-rows";
import {
  DECISION_PANEL_COPY,
  TRADED_UP_PHRASE,
  WEIGHT_PHRASE,
} from "./copy";

/** The reason that sends a person to DR-04 before the decision is complete. */
export const TRADED_UP_REASON_KEY = "stayed_on_important";

export type DecisionVerdict = "not-counted" | "half" | "missed";

export type Decision =
  | { kind: "carry" }
  | {
      kind: "missed";
      tier: MissTier;
      reasonKey: string | null;
      reasonText: string | null;
      tradedUpItemId: string | null;
      verdict: DecisionVerdict;
    };

export interface DecisionPanelProps {
  item: DayItemView;
  state: DecisionState;
  decision: Decision | null;
  reasons: Readonly<Record<MissTier, readonly ReasonView[]>>;
  /** Tasks and appointments only — a habit cannot be carried. */
  canCarry: boolean;
  carriedCount?: number;
  carriedSince?: string;
  /** Present on panels a shift already resolved. */
  shiftContext?: { deltaMin: number };
  timeZone: string;
  onCarry: () => void;
  onMissed: () => void;
  onDecide: (decision: Decision) => void;
  onChange: () => void;
  onTradedUp: () => void;
  note?: string;
  onNoteChange?: (note: string) => void;
  className?: string;
}

const VERDICT: Record<MissTier, DecisionVerdict> = {
  circumstance: "not-counted",
  scoping: "half",
  chose_not_to: "missed",
};

export function DecisionPanel({
  item,
  state,
  decision,
  reasons,
  canCarry,
  carriedCount,
  carriedSince,
  shiftContext,
  timeZone,
  onCarry,
  onMissed,
  onDecide,
  onChange,
  onTradedUp,
  note,
  onNoteChange,
  className,
}: DecisionPanelProps) {
  const [tier, setTier] = React.useState<MissTier | null>(null);
  const [reasonKey, setReasonKey] = React.useState<string | null>(null);
  const [otherText, setOtherText] = React.useState("");
  const [noteOpen, setNoteOpen] = React.useState(false);

  const decided = state === "decided" || state === "resolved-by-shift";

  const selectTier = (next: MissTier) => {
    setTier(next);
    setReasonKey(null);
    // Tier 3 is the whole answer; it decides on selection (DR-03).
    if (next === "chose_not_to") {
      onDecide({
        kind: "missed",
        tier: next,
        reasonKey: null,
        reasonText: null,
        tradedUpItemId: null,
        verdict: VERDICT[next],
      });
    }
  };

  const selectReason = (key: string) => {
    setReasonKey(key);
    if (tier === null) return;
    if (key === TRADED_UP_REASON_KEY) {
      onTradedUp();
      return;
    }
    // "Other" needs its text before it can decide.
    if (key === OTHER_REASON_KEY) return;
    onDecide({
      kind: "missed",
      tier,
      reasonKey: key,
      reasonText: null,
      tradedUpItemId: null,
      verdict: VERDICT[tier],
    });
  };

  const decidedText = (): { text: string; phrase: string } | null => {
    if (decision === null) return null;
    if (decision.kind === "carry") {
      return { text: DECISION_PANEL_COPY.carriedTo, phrase: "" };
    }
    if (decision.tradedUpItemId !== null) {
      return { text: "Missed — stayed on something more important", phrase: TRADED_UP_PHRASE };
    }
    return {
      text: `Missed — ${decision.reasonText ?? decision.reasonKey ?? ""}`.trim(),
      phrase: WEIGHT_PHRASE[decision.tier],
    };
  };

  const summary = decidedText();

  return (
    <section
      className={cn(
        "border-hairline flex flex-col gap-(--space-3) border-b py-(--space-5) last:border-b-0",
        className,
      )}
    >
      <div className="flex items-center gap-(--space-3)">
        <ItemIcon icon={item.icon} size={24} />
        <Text as="h3" variant="row-title" weight={500} truncate className="min-w-0 flex-1">
          {item.title}
        </Text>
        {/* When it was meant to happen — in the day's zone, not the viewer's. */}
        {item.scheduledStart === null ? null : (
          <TimeText
            mode="at"
            start={item.scheduledStart}
            timeZone={timeZone}
            tone="secondary"
            size="caption"
          />
        )}
      </div>

      {decided && summary !== null ? (
        <DecidedLine
          text={summary.text}
          weightPhrase={summary.phrase}
          onChange={onChange}
          note={
            shiftContext !== undefined
              ? DECISION_PANEL_COPY.changedFromShift
              : carriedCount !== undefined && carriedSince !== undefined
                ? DECISION_PANEL_COPY.carriedNote(carriedCount, carriedSince)
                : undefined
          }
        />
      ) : (
        <>
          <div className="flex gap-(--space-2)">
            {canCarry ? (
              <Button
                variant="secondary"
                onClick={onCarry}
                className="h-14 flex-1"
              >
                {DECISION_PANEL_COPY.carryForward}
              </Button>
            ) : null}
            <Button
              onClick={onMissed}
              className={cn("h-14", canCarry ? "flex-1" : "w-full")}
            >
              {DECISION_PANEL_COPY.missed}
            </Button>
          </div>

          {state === "deciding" ? (
            <TierRadioRows
              label="Why"
              value={tier}
              onChange={selectTier}
              reasons={reasons}
              selectedReason={reasonKey}
              onReasonSelect={selectReason}
              otherText={otherText}
              onOtherTextChange={setOtherText}
            />
          ) : null}
        </>
      )}

      {onNoteChange === undefined ? null : noteOpen ? (
        <Textarea
          label={DECISION_PANEL_COPY.noteLabel}
          maxLength={280}
          value={note ?? ""}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      ) : (
        <TextDisclosureButton
          expanded={false}
          collapsedLabel={DECISION_PANEL_COPY.addNote}
          expandedLabel={DECISION_PANEL_COPY.addNote}
          onClick={() => setNoteOpen(true)}
          className="self-start"
        />
      )}
    </section>
  );
}
