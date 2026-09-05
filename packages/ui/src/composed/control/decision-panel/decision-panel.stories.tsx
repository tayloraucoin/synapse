import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  REASONS,
  STORY_TIME_ZONE,
  itemInState,
} from "../../__fixtures__/view-models";
import { DecisionPanel, type Decision } from "./decision-panel";

/**
 * DR-02 and DR-05. No card, hairline only — a day's review is a column of
 * these, and fifteen cards is a filing cabinet.
 *
 * The decision is written only when it can be: tier 3 decides on selection,
 * tiers 1 and 2 need a reason chip, and *Stayed on something more important*
 * opens DR-04 first. A half-answered panel never writes a Miss.
 */
const meta: Meta<typeof DecisionPanel> = {
  title: "Composed/Control/DecisionPanel",
  component: DecisionPanel,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-xl p-(--space-6)"><Story /></div>],
};

export default meta;

function Interactive({ canCarry }: { canCarry: boolean }) {
  const [state, setState] = React.useState<
    "undecided" | "deciding" | "decided"
  >("undecided");
  const [decision, setDecision] = React.useState<Decision | null>(null);

  return (
    <DecisionPanel
      item={itemInState("missed", {
        title: canCarry ? "Book the dentist" : "Morning run",
        type: canCarry ? "task_appointment" : "habit",
      })}
      state={state}
      decision={decision}
      reasons={REASONS}
      canCarry={canCarry}
      timeZone={STORY_TIME_ZONE}
      onCarry={() => {
        setDecision({ kind: "carry" });
        setState("decided");
      }}
      onMissed={() => setState("deciding")}
      onDecide={(next) => {
        setDecision(next);
        setState("decided");
      }}
      onChange={() => setState("undecided")}
      onTradedUp={() => {}}
    />
  );
}

/** A task can be carried; a habit cannot, so it shows *Missed* alone. */
export const Task: StoryObj = { render: () => <Interactive canCarry /> };

export const Habit: StoryObj = { render: () => <Interactive canCarry={false} /> };

export const Decided: StoryObj<typeof DecisionPanel> = {
  args: {
    item: itemInState("missed", { title: "Morning run" }),
    state: "decided",
    decision: {
      kind: "missed",
      tier: "scoping",
      reasonKey: "slept_in",
      reasonText: "slept in",
      tradedUpItemId: null,
      verdict: "half",
    },
    reasons: REASONS,
    canCarry: false,
    timeZone: STORY_TIME_ZONE,
    onCarry: () => {},
    onMissed: () => {},
    onDecide: () => {},
    onChange: () => {},
    onTradedUp: () => {},
  },
};

/** A shift already answered this; *Change* is still offered. */
export const ResolvedByShift: StoryObj<typeof DecisionPanel> = {
  args: {
    ...Decided.args,
    state: "resolved-by-shift",
    shiftContext: { deltaMin: 60 },
  },
};
