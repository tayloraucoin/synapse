import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SLOTS_PREP, SLOTS_ROUTINE, slotWith } from "../../__fixtures__/view-models";
import { SlotRow } from "./slot-row";

const meta: Meta<typeof SlotRow> = {
  title: "Composed/Display/SlotRow",
  component: SlotRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="divide-hairline max-w-2xl divide-y">
        <Story />
      </ul>
    ),
  ],
  args: { onOpen: () => {} },
};

export default meta;

type Story = StoryObj<typeof SlotRow>;

export const Stack: Story = { args: { slot: slotWith({ title: "Breath work" }) } };

/** A five-minute gap before: the dashed band with *+5* in the gutter (§3.11). */
export const WithGap: Story = {
  args: { slot: slotWith({ title: "Stretch", gapBeforeMin: 5, startClock: "7:13", endClock: "7:23", durationMin: 10 }) },
};

/** A pin: the anchor glyph and its clock; no gap (§3.2, §3.11). */
export const Pinned: Story = {
  args: { slot: slotWith({ title: "Cold shower", pinnedClock: "7:30", startClock: "7:30", endClock: "7:36", durationMin: 6 }) },
};

export const Opener: Story = { args: { slot: slotWith({ title: "Breath work", role: "opener" }) } };
export const Closer: Story = { args: { slot: slotWith({ title: "Stretch", role: "closer" }) } };

/** A pool item: a lighter band, *decide in the morning*, no clock (§3.4). */
export const Pool: Story = {
  args: { slot: slotWith({ title: "Meditate", role: "pool", startClock: null, endClock: null, durationMin: 15 }) },
};

/** *One of*: two tabs, the default filled (§3.5). */
export const OneOf: Story = { args: { slot: SLOTS_PREP[0] } };

/** Taylor's *Before work*, then an opener · pool · closer routine. */
export const Templates: StoryObj = {
  render: () => (
    <>
      {SLOTS_PREP.map((slot) => (
        <SlotRow key={slot.id} slot={slot} onOpen={() => {}} />
      ))}
      <li aria-hidden="true" className="h-(--space-6)" />
      {SLOTS_ROUTINE.map((slot) => (
        <SlotRow key={slot.id} slot={slot} onOpen={() => {}} />
      ))}
    </>
  ),
};
