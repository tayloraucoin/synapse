import type { MissTier } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { REASONS } from "../../__fixtures__/view-models";
import { TierRadioRows } from "./tier-radio-rows";

/**
 * DR-03. Three rows, each with its weighting as a second line — words, never
 * percentages: a review that showed "50%" would be scoring the day.
 *
 * Tier 3 has no chips because *Didn't do it* is already the whole answer.
 * Selected is a 2px ink left edge, not a fill: these rows carry a sentence
 * each, and filling one inverts a definition.
 */
const meta: Meta<typeof TierRadioRows> = {
  title: "Composed/Control/TierRadioRows",
  component: TierRadioRows,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

export const WithReasons: StoryObj = {
  render: function Render() {
    const [tier, setTier] = React.useState<MissTier | null>(null);
    const [reason, setReason] = React.useState<string | null>(null);
    const [other, setOther] = React.useState("");
    return (
      <TierRadioRows
        label="Why"
        value={tier}
        onChange={(next) => {
          setTier(next);
          setReason(null);
        }}
        reasons={REASONS}
        selectedReason={reason}
        onReasonSelect={setReason}
        otherText={other}
        onOtherTextChange={setOther}
        onKeepReason={() => {}}
      />
    );
  },
};

/** ST-06a — the tier is shown, not changeable. Nothing is wrong, so nothing greys. */
export const Locked: StoryObj<typeof TierRadioRows> = {
  args: {
    label: "Counts as",
    value: null,
    onChange: () => {},
    lockedTier: "scoping",
  },
};

export const WithError: StoryObj<typeof TierRadioRows> = {
  args: {
    label: "Why",
    value: null,
    onChange: () => {},
    error: "Pick one before finishing.",
  },
};
