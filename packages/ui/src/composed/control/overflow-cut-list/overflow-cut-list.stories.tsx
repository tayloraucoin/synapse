import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { itemInState } from "../../__fixtures__/view-models";
import { OverflowCutList, type OverflowItem } from "./overflow-cut-list";

/**
 * SF-01 step 3. The tally is the point — a person cutting items needs to see
 * the number fall, or they are guessing.
 *
 * Items that have already passed cannot be cut and are not decisions; they sit
 * in a second, muted list rather than mixed into the choices.
 */
const meta: Meta<typeof OverflowCutList> = {
  title: "Composed/Control/OverflowCutList",
  component: OverflowCutList,
  decorators: [(Story) => <div className="max-w-xl p-(--space-6)"><Story /></div>],
};

export default meta;

const ITEMS: readonly OverflowItem[] = [
  { ...itemInState("upcoming", { title: "Evening walk", priority: 2 }), newStartLabel: "8:40 PM" },
  { ...itemInState("upcoming", { title: "Journal", priority: 3, durationMin: 15 }), newStartLabel: "9:20 PM" },
  { ...itemInState("upcoming", { title: "Read", priority: 4, durationMin: 30 }), newStartLabel: "9:35 PM" },
];

export const Over: StoryObj = {
  render: function Render() {
    const [cut, setCut] = React.useState<ReadonlySet<string>>(new Set());
    const saved = ITEMS.filter((item) => cut.has(item.id)).reduce(
      (sum, item) => sum + (item.durationMin ?? 0),
      0,
    );
    return (
      <OverflowCutList
        items={ITEMS}
        cut={cut}
        onChange={setCut}
        overMin={Math.max(0, 55 - saved)}
        passedHard={[itemInState("passed", { title: "Dentist" })]}
      />
    );
  },
};

export const Fits: StoryObj<typeof OverflowCutList> = {
  args: {
    items: ITEMS,
    cut: new Set(["item-upcoming"]),
    onChange: () => {},
    overMin: 0,
    passedHard: [],
  },
};
