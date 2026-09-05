import type { SaveStatus } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SaveStatusText } from "./save-status";

/**
 * `retrying` and `failed` read in ink at the same weight as the rest of the
 * header — never a colour (official spec §9.3). `idle` renders nothing: a
 * canvas that says "Saved" before anything is typed is talking about itself.
 */
const meta: Meta<typeof SaveStatusText> = {
  title: "Composed/Feedback/SaveStatus",
  component: SaveStatusText,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SaveStatusText>;

export const Saving: Story = { args: { status: "saving" } };

export const Saved: Story = { args: { status: "saved" } };

export const Failed: Story = { args: { status: "failed", onRetry: () => {} } };

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-2) p-(--space-6)">
      {(["idle", "saving", "saved", "retrying", "failed"] as SaveStatus[]).map(
        (status) => (
          <SaveStatusText key={status} status={status} onRetry={() => {}} />
        ),
      )}
    </div>
  ),
};
