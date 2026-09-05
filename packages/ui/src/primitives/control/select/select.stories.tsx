import type { Meta, StoryObj } from "@storybook/react";

import { SelectField } from "./select";

const meta: Meta<typeof SelectField> = {
  title: "Primitives/Control/Select",
  component: SelectField,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const OPTIONS = [
  { value: "leaf", label: "Movement" },
  { value: "sky", label: "Deep work" },
  { value: "clay", label: "Home" },
  { value: "rose", label: "People", disabled: true },
];

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-sm flex-col gap-(--space-5) p-(--space-6)">
      <SelectField
        label="Category"
        placeholder="No category"
        options={OPTIONS}
        helperText="Used for time reporting only."
      />
      <SelectField
        label="Category"
        placeholder="No category"
        options={OPTIONS}
        error="Pick one."
      />
      <SelectField label="Category" options={OPTIONS} disabled placeholder="No category" />
    </div>
  ),
};
