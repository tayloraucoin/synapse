import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";
import { CheckboxField } from "./checkbox-field";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Control/Checkbox",
  component: Checkbox,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** The 20px mark; the 44px target comes from the row around it. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [checked, setChecked] = React.useState(true);
    return (
      <div className="flex max-w-sm flex-col gap-(--space-4) p-(--space-6)">
        <div className="flex items-center gap-(--space-4)">
          <Checkbox aria-label="Unchecked" />
          <Checkbox defaultChecked aria-label="Checked" />
          <Checkbox disabled aria-label="Disabled" />
          <Checkbox disabled defaultChecked aria-label="Disabled checked" />
        </div>
        <CheckboxField checked={checked} onCheckedChange={(v) => setChecked(v === true)}>
          Quiet after Day Complete — once you close a day, nothing arrives until
          the next day&apos;s first item.
        </CheckboxField>
      </div>
    );
  },
};
