import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "../../display/label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/Control/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

/** The three tiers of the Day Review chooser (Epic 3 DR-03). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <RadioGroup defaultValue="circumstance" className="max-w-sm p-(--space-6)">
      {[
        ["circumstance", "Something came up", "done for the record"],
        ["scoping", "Planned it wrong", "counts half"],
        ["chose_not_to", "Didn't do it", "counts as missed"],
      ].map(([value, label, weight]) => (
        <label
          key={value}
          className="flex min-h-(--row-min) cursor-pointer items-center gap-(--space-3)"
        >
          <RadioGroupItem value={value as string} />
          <span className="flex flex-col">
            <Label>{label}</Label>
            <span className="text-text-secondary font-sans text-(length:--fs-caption)">
              {weight}
            </span>
          </span>
        </label>
      ))}
    </RadioGroup>
  ),
};
