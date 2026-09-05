import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TemplateUsageRow } from "./template-usage-row";

const meta: Meta<typeof TemplateUsageRow> = {
  title: "Composed/Display/TemplateUsageRow",
  component: TemplateUsageRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="divide-hairline max-w-xl divide-y p-(--space-6)">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TemplateUsageRow>;

export const AgainstTarget: Story = {
  args: { name: "Weekday morning", used: 2, target: 2 },
};

export const Behind: Story = {
  args: { name: "Long run", used: 1, target: 3 },
};

/** No target — the row states the count and stops. */
export const NoTarget: Story = { args: { name: "Rest day", used: 3, target: null } };
