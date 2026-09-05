import type { ItemState } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  CATEGORY_SKY,
  STORY_TIME_ZONE,
  itemInState,
} from "../../__fixtures__/view-models";
import { ItemRow } from "./item-row";

/**
 * The row a person touches most. `item.state` drives every visual, so the
 * fifteen-state story below is the whole truth about how this row can look —
 * if a state is not on that sheet, the row cannot render it.
 */
const meta: Meta<typeof ItemRow> = {
  title: "Composed/Display/ItemRow",
  component: ItemRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="divide-hairline max-w-2xl divide-y">
        <Story />
      </ul>
    ),
  ],
  args: {
    timeZone: STORY_TIME_ZONE,
    onToggleDone: () => {},
    onOpen: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof ItemRow>;

export const Upcoming: Story = { args: { item: itemInState("upcoming") } };

export const Now: Story = { args: { item: itemInState("now") } };

export const Active: Story = {
  args: { item: itemInState("active", { timerElapsedSec: 761 }) },
};

export const Done: Story = {
  args: {
    item: itemInState("done", { doneAt: new Date(Date.UTC(2026, 8, 4, 16, 12)) }),
  },
};

/** A done item that still owes its number shows the *add {unit}* tail. */
export const DoneNeedsQuantity: Story = {
  args: {
    item: itemInState("done", {
      title: "Read",
      quantityUnit: "pages",
      quantityValue: null,
      category: CATEGORY_SKY,
    }),
  },
};

export const Carried: Story = {
  args: {
    item: itemInState("carried", {
      title: "Book the dentist",
      carriedFromLabel: "Thu",
      type: "task_appointment",
    }),
  },
};

/** The five-second inline undo takes over the state-word slot. */
export const WithUndo: Story = {
  args: {
    item: itemInState("done"),
    undo: { label: "Undo", onUndo: () => {} },
  },
};

/** LS-02/03 and TR-01: no checkbox, one text action. */
export const FadedWithAction: Story = {
  args: {
    item: itemInState("cut-by-shift", { title: "Stretch" }),
    variant: "faded-with-action",
    action: { label: "Keep instead", onClick: () => {} },
  },
};

/** Plan mode — nothing to toggle and nothing to open. */
export const ReadOnly: Story = {
  args: { item: itemInState("upcoming"), variant: "read-only" },
};

const ALL_STATES: readonly ItemState[] = [
  "upcoming",
  "soon",
  "now",
  "open",
  "closing",
  "active",
  "passed",
  "done",
  "done-off-schedule",
  "deferred",
  "carried",
  "not-assigned",
  "cut-by-shift",
  "missed",
  "pending-review",
];

/** Every state the view model can hold, in one sheet. */
export const AllStates: StoryObj = {
  render: () => (
    <>
      {ALL_STATES.map((state) => (
        <ItemRow
          key={state}
          item={itemInState(state, {
            title: state,
            timerElapsedSec: state === "active" ? 761 : null,
            carriedFromLabel: state === "carried" ? "Thu" : null,
          })}
          timeZone={STORY_TIME_ZONE}
          onToggleDone={() => {}}
          onOpen={() => {}}
        />
      ))}
    </>
  ),
};
