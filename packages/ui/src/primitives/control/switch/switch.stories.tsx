import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "../../display/label";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Control/Switch",
  component: Switch,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [on, setOn] = React.useState(true);
    return (
      <div className="flex flex-col gap-(--space-4) p-(--space-6)">
        <div className="flex items-center gap-(--space-3)">
          <Switch id="n1" checked={on} onCheckedChange={setOn} />
          <Label htmlFor="n1">Fixed-time item start</Label>
        </div>
        <div className="flex items-center gap-(--space-3)">
          <Switch checked={false} aria-label="Window opens" />
          <Label>Window opens</Label>
        </div>
        <div className="flex items-center gap-(--space-3)">
          <Switch checked disabled aria-label="Quiet after Day Complete" />
          <Label>Quiet after Day Complete (non-editable)</Label>
        </div>
      </div>
    );
  },
};
