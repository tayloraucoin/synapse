import type { Meta, StoryObj } from "@storybook/react";
import { LinearStatusShape } from "./linear-status-shape";

/**
 * A Linear status as Linear draws it (D-USE-35), its word always beside it.
 * Started is part filled by its place in its group: In progress at one half,
 * In review at three quarters.
 */
const meta: Meta<typeof LinearStatusShape> = {
  title: "Composed/Display/LinearStatusShape",
  component: LinearStatusShape,
};

export default meta;

type Story = StoryObj<typeof LinearStatusShape>;

export const Backlog: Story = { args: { type: "backlog", label: "Backlog" } };

export const Unstarted: Story = { args: { type: "unstarted", label: "Todo" } };

export const Started: Story = {
  args: { type: "started", label: "In progress", progress: 0.5 },
};

export const StartedLater: Story = {
  args: { type: "started", label: "In review", progress: 0.75 },
};

export const Completed: Story = { args: { type: "completed", label: "Done" } };

export const Canceled: Story = {
  args: { type: "canceled", label: "Canceled" },
};

/** Every status in a column, as on the status picker. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-2)">
      <LinearStatusShape type="backlog" label="Backlog" />
      <LinearStatusShape type="unstarted" label="Todo" />
      <LinearStatusShape type="started" label="In progress" progress={0.5} />
      <LinearStatusShape type="started" label="In review" progress={0.75} />
      <LinearStatusShape type="completed" label="Done" />
      <LinearStatusShape type="canceled" label="Canceled" />
    </div>
  ),
};
