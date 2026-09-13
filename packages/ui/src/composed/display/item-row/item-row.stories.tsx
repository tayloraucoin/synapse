import type { ItemState } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  BLOCK_MORNING,
  BLOCK_WORK,
  CATEGORY_SKY,
  DEVICES_OFF_MARKER,
  SPLIT_WORK_DAY,
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
  "moved",
  "confirm-later",
  "not-confirmed",
];

/*
 * ---- UX v1.1 (DYN-7): the container, the pin, the marker, the three faces ----
 */

/** The work block as one row: the focus as its title, the fixtures nested, no checkbox (§6.1). */
export const Container: StoryObj = {
  render: () => {
    const [focus, ...fixtures] = BLOCK_WORK.items;
    return (
      <ItemRow
        item={focus as (typeof BLOCK_WORK.items)[number]}
        variant="container"
        timeZone={STORY_TIME_ZONE}
        onOpen={() => {}}
      >
        {fixtures.map((fixture) => (
          <ItemRow key={fixture.id} item={fixture} timeZone={STORY_TIME_ZONE} onOpen={() => {}} />
        ))}
      </ItemRow>
    );
  },
};

/** Split around training: two container rows with the workout between (§6.1). */
export const ContainerSplit: StoryObj = {
  render: () => {
    const [, , , workA, training, workB] = SPLIT_WORK_DAY;
    const rows = [workA, training, workB].filter((block) => block !== undefined);
    return (
      <>
        {rows.map((block) =>
          block.kind === "work" ? (
            <ItemRow
              key={block.id}
              item={block.items[0] as (typeof block.items)[number]}
              variant="container"
              timeZone={STORY_TIME_ZONE}
              onOpen={() => {}}
            >
              {block.items.slice(1).map((fixture) => (
                <ItemRow key={fixture.id} item={fixture} timeZone={STORY_TIME_ZONE} onOpen={() => {}} />
              ))}
            </ItemRow>
          ) : (
            block.items.map((item) => (
              <ItemRow key={item.id} item={item} timeZone={STORY_TIME_ZONE} onToggleDone={() => {}} onOpen={() => {}} />
            ))
          ),
        )}
      </>
    );
  },
};

/** The anchor glyph before the title; the row reads *pinned* (§6.1, §10.1). */
export const Pinned: Story = {
  args: { item: itemInState("upcoming", { title: "Stand-up", pinned: true, scheduling: "hard" }) },
};

/** After devices-off: no checkbox, the caption *confirm in the morning* (§7.1). */
export const ConfirmLater: Story = {
  args: { item: itemInState("confirm-later", { title: "Read" }) },
};

/** Left unticked the next morning: faded, *not confirmed*, still a decision (§7.3). */
export const NotConfirmed: Story = {
  args: { item: itemInState("not-confirmed", { title: "Stretch" }) },
};

/** A re-plan before it happens: the word, the planned time unchanged (§10.1). */
export const Moved: Story = {
  args: { item: BLOCK_MORNING.items[4] as (typeof BLOCK_MORNING.items)[number] },
};

/** The devices-off marker: a hairline row, the glyph, the time, no checkbox (§7.1). */
export const DevicesOffMarker: Story = {
  args: { item: DEVICES_OFF_MARKER, marker: true },
};

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
