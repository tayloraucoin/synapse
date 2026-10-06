"use client";

/**
 * Pillar 3's figure — SYS-6, `docs/ux/landing-page-ux.md` §5.
 *
 * One undone item, already decided, with the number and the sentence that
 * explains it underneath. Press *Change*, pick a different reason, and the
 * arithmetic moves. This is the real `DecisionPanel` on a real `DayItemView`,
 * not a drawing of one, because the product's position on scoring is the thing
 * being shown: a percentage alone is a grade, and a percentage with its terms
 * spelled out is a reckoning a person can argue with (official spec §7.4, R6).
 *
 * THE NUMBER IS NEVER RENDERED ALONE (Sage's condition, Decision 13). To a
 * visitor who left a streak app, a bare percentage reads as the enemy's grade;
 * the sentence beside it, and the fact that the visitor can move it, is what
 * makes it arithmetic instead of judgment.
 *
 * TWO PANEL WARTS ARE HANDLED HERE, NOT FORKED. `DecisionPanel.onDecide` hands
 * back a reason KEY with a null text, and the panel prints `reasonText ??
 * reasonKey` — so passing the payload straight through would show a person
 * `something_came_up`. Tier 3 decides with no reason at all and renders a bare
 * "Missed —". Both are fixed by filling `reasonText` in this caller; see
 * `reasonTextFor`, which carries the `[REVISIT — REV-2]` note.
 */

import type { DecisionState, MissTier } from "@syn/types";
import {
  BigNumber,
  DecisionPanel,
  FormulaSentence,
  type Decision,
} from "@syn/ui";
import * as React from "react";

import {
  buildDecidedItem,
  EXAMPLE_REASONS,
  reasonTextFor,
  reviewSums,
  STATIC_TIME_ZONE,
} from "./example-day";

const INITIAL_TIER: MissTier = "circumstance";

const INITIAL_DECISION: Decision = {
  kind: "missed",
  tier: INITIAL_TIER,
  reasonKey: "something_came_up",
  reasonText: reasonTextFor(INITIAL_TIER, "something_came_up"),
  tradedUpItemId: null,
  verdict: "not-counted",
};

export function ReviewFigure({ className }: { className?: string }) {
  const item = React.useMemo(() => buildDecidedItem(), []);
  const [state, setState] = React.useState<DecisionState>("decided");
  const [decision, setDecision] = React.useState<Decision>(INITIAL_DECISION);

  const tier = decision.kind === "missed" ? decision.tier : INITIAL_TIER;
  const sums = reviewSums(tier);

  return (
    <div className={className}>
      <DecisionPanel
        item={item}
        state={state}
        decision={decision}
        reasons={EXAMPLE_REASONS}
        /* A habit cannot be carried to tomorrow, so the choice is not offered. */
        canCarry={false}
        timeZone={STATIC_TIME_ZONE}
        onCarry={() => undefined}
        onMissed={() => setState("deciding")}
        onChange={() => setState("deciding")}
        onDecide={(next) => {
          setDecision(
            next.kind === "missed"
              ? { ...next, reasonText: reasonTextFor(next.tier, next.reasonKey) }
              : next,
          );
          setState("decided");
        }}
        /* Unreachable: the traded-up reason is not in `EXAMPLE_REASONS`. */
        onTradedUp={() => undefined}
      />

      <div className="flex flex-col gap-(--space-2) pt-(--space-4)">
        <BigNumber value={sums.percent} size="day" />
        <FormulaSentence
          terms={sums.terms}
          credit={sums.credit}
          counted={sums.counted}
          percent={sums.percent}
        />
      </div>
    </div>
  );
}
