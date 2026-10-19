import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScheduleBullets } from "./schedule-bullets";

/**
 * A block's items in fixed 145 px cells (D-USE-23). The caller lays them
 * with `bulletGrid` from the block's height; "+n more" counts only what did
 * not fit. The cells wrap at the width, so a wider block shows more a line.
 */
const meta: Meta<typeof ScheduleBullets> = {
  title: "Composed/Display/ScheduleBullets",
  component: ScheduleBullets,
  decorators: [
    (Story) => (
      <div className="w-75 rounded-(--radius-control) bg-category-leaf-chip p-(--space-2)">
        <Story />
      </div>
    ),
  ],
  args: { dotClassName: "bg-category-leaf-dot" },
};

export default meta;

type Story = StoryObj<typeof ScheduleBullets>;

/** Wellness at the phone: three and "+2 more" in two lines of two. */
export const WithMore: Story = {
  args: {
    bullets: [
      { id: "1", label: "Pee and weigh", tone: "dot" },
      { id: "2", label: "Water", tone: "dot" },
      { id: "3", label: "Start the cold bath", tone: "dot" },
    ],
    moreCount: 2,
  },
};

/** Training: the drives are transitions, a dash in muted italic. */
export const Transitions: Story = {
  args: {
    bullets: [
      { id: "1", label: "Drive to the YMCA", tone: "transition" },
      { id: "2", label: "Workout: gym", tone: "dot" },
      { id: "3", label: "Drive home", tone: "transition" },
    ],
  },
};

/** Each bullet a shortcut to its item. */
export const Tappable: Story = {
  args: {
    bullets: [
      {
        id: "1",
        label: "Water",
        tone: "dot",
        onOpen: () => {},
        ariaLabel: "Water, in Wellness",
      },
      {
        id: "2",
        label: "Meditate",
        tone: "dot",
        onOpen: () => {},
        ariaLabel: "Meditate, in Wellness",
      },
    ],
  },
};

/** At the desk's width, four cells a line. */
export const Wide: Story = {
  decorators: [
    (Story) => (
      <div className="w-160 rounded-(--radius-control) bg-category-leaf-chip p-(--space-2)">
        <Story />
      </div>
    ),
  ],
  args: WithMore.args,
};

/** Work's tier: one item a line, the Linear id beside the title. */
export const Lines: Story = {
  args: {
    layout: "lines",
    dotClassName: "bg-category-sky-dot",
    bullets: [
      { id: "1", label: "[Primary item, linked] · ENG-123", tone: "dot" },
      { id: "2", label: "[Primary item]", tone: "dot" },
    ],
  },
};

/**
 * Schedule's marks (USE-27): checked items a check in the block's colour,
 * the words muted; planned a dot. Never colour alone.
 */
export const Checked: Story = {
  args: {
    checkClassName: "text-category-leaf-dot",
    bullets: [
      {
        id: "1",
        label: "Pee and weigh",
        tone: "dot",
        mark: "check",
        markLabel: "done",
      },
      {
        id: "2",
        label: "Water",
        tone: "dot",
        mark: "check",
        markLabel: "done",
      },
      {
        id: "3",
        label: "Start the cold bath",
        tone: "dot",
        mark: "check",
        markLabel: "done",
      },
    ],
    moreCount: 2,
  },
};

/**
 * Work's lines: done, running (a now dot in a ring that pulses, held still
 * under reduced motion, "· running"), firing (a clay dot in a muted halo,
 * the words receded, never the now colour) and planned.
 */
export const RunningAndFiring: Story = {
  decorators: [
    (Story) => (
      <div className="w-80 rounded-(--radius-control) bg-category-sky-chip p-(--space-2)">
        <Story />
      </div>
    ),
  ],
  args: {
    layout: "lines",
    dotClassName: "bg-category-sky-dot",
    checkClassName: "text-category-sky-dot",
    bullets: [
      {
        id: "1",
        label: "[Write the sync spec] · ENG-123",
        tone: "dot",
        mark: "check",
        markLabel: "done",
      },
      {
        id: "2",
        label: "[Review the Paper handoff]",
        tone: "dot",
        mark: "running",
        suffix: "· running",
      },
      {
        id: "3",
        label: "[Draft the release notes]",
        tone: "dot",
        mark: "firing",
        suffix: "· firing",
      },
      {
        id: "4",
        label: "[Answer the review comments]",
        tone: "dot",
        mark: "dot",
      },
    ],
  },
};

/** Item icons (USE-42; item-icons.md): an icon takes the dot's place; "+2 more" stays text. */
export const ItemIcons: Story = {
  args: {
    bullets: [
      { id: "1", label: "Pee and weigh", tone: "dot", icon: "⚖️" },
      { id: "2", label: "Water", tone: "dot", icon: "💧" },
      { id: "3", label: "Drive to the YMCA", tone: "transition", icon: "🚗" },
    ],
    moreCount: 2,
  },
};
