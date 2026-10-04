import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  TASK_BACK_WITH_NOTE,
  TASK_CLOSED,
  TASK_FIRING_4,
  TASK_FIRING_72,
  TASK_FIRING_FIRST_MINUTE,
  TASK_LONG_TITLE,
  TASK_NEVER_FIRED,
  TASK_PLAIN,
  WORKFLOW_STORY_NOW,
} from "../../__fixtures__/workflow";
import { EllipsesMenu } from "../../control/ellipses-menu";
import { TaskRow, TaskRowSkeleton } from "./task-row";

/**
 * A board row. Firing recedes (title secondary, words in `accent-text`, no
 * note); the person's rows stand; the next row is the only one on a surface
 * and always says *next*. Nothing moves but the mark in the toggle.
 */
const meta: Meta<typeof TaskRow> = {
  title: "Composed/Display/TaskRow",
  component: TaskRow,
  args: {
    task: TASK_FIRING_4,
    variant: "active",
    now: WORKFLOW_STORY_NOW,
    groupName: "Northwind",
    columnName: "In progress",
    onOpen: () => {},
    onFiringChange: () => {},
    menu: <EllipsesMenu label="Draft the onboarding email options" items={[{ label: "Open" }, { label: "Archive" }]} />,
  },
  decorators: [
    (Story) => (
      <ul className="m-0 flex max-w-(--board-col-wide) list-none flex-col p-0">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TaskRow>;

export const Firing4Min: Story = { name: "Firing, 4 min" };

export const FiringFirstMinute: Story = {
  name: "Firing, first minute",
  args: { task: TASK_FIRING_FIRST_MINUTE, groupName: "Harbor" },
};

export const Firing72Min: Story = {
  name: "Firing, 1 h 12 min",
  args: { task: TASK_FIRING_72, groupName: "Harbor" },
};

export const BackWithNote: Story = { name: "Back, 2 min, with a note", args: { task: TASK_BACK_WITH_NOTE } };

export const NeverFired: Story = { name: "Never fired", args: { task: TASK_NEVER_FIRED, groupName: "Internal" } };

export const Next: Story = { args: { task: TASK_NEVER_FIRED, groupName: "Internal", isNext: true } };

export const NextAndBack: Story = { name: "Next and back", args: { task: TASK_BACK_WITH_NOTE, isNext: true } };

/** `isNext` on a firing task is ignored — a firing task is never next. */
export const NextIgnoredWhileFiring: Story = { args: { isNext: true } };

export const Plain: Story = { args: { task: TASK_PLAIN, variant: "plain", columnName: "Ongoing" } };

export const Closed: Story = { args: { task: TASK_CLOSED, variant: "closed", columnName: "Done" } };

export const Lifted: Story = { args: { task: TASK_BACK_WITH_NOTE, lifted: true } };

export const Disabled: Story = { args: { task: TASK_BACK_WITH_NOTE, disabled: true } };

export const NoFiringHandler: Story = {
  name: "Active, no firing handler (toggle disabled)",
  args: { task: TASK_NEVER_FIRED, onFiringChange: undefined },
};

export const LongTitleAt320: Story = {
  name: "Long title at 320px",
  args: { task: TASK_LONG_TITLE },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Skeleton: Story = { render: () => <TaskRowSkeleton /> };

/** Every state at once, for a theme-toggle pass. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: (args) => (
    <>
      <TaskRow {...args} task={TASK_FIRING_4} />
      <TaskRow {...args} task={TASK_FIRING_FIRST_MINUTE} groupName="Harbor" />
      <TaskRow {...args} task={TASK_BACK_WITH_NOTE} isNext />
      <TaskRow {...args} task={TASK_NEVER_FIRED} groupName="Internal" />
      <TaskRow {...args} task={TASK_PLAIN} variant="plain" columnName="Ongoing" />
      <TaskRow {...args} task={TASK_CLOSED} variant="closed" columnName="Done" />
      <TaskRowSkeleton />
    </>
  ),
};
