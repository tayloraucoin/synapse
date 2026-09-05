import type { Meta, StoryObj } from "@storybook/react";

import { CollapsiblePanel } from "./collapsible";

const meta: Meta<typeof CollapsiblePanel> = {
  title: "Primitives/Layout/Collapsible",
  component: CollapsiblePanel,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof CollapsiblePanel>;

/** The "3 not assigned today" expander (Epic 2 LS-02). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="max-w-md p-(--space-6)">
      <CollapsiblePanel trigger={<span>3 not assigned today</span>}>
        <p className="text-text-secondary m-0 py-(--space-2)">
          Trimmed to fit 45 min. These don&apos;t count.
        </p>
      </CollapsiblePanel>
    </div>
  ),
};
