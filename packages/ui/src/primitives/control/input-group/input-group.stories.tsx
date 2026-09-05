import type { Meta, StoryObj } from "@storybook/react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./input-group";

const meta: Meta<typeof InputGroup> = {
  title: "Primitives/Control/InputGroup",
  component: InputGroup,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-sm flex-col gap-(--space-4) p-(--space-6)">
      <InputGroup>
        <InputGroupInput placeholder="45" inputMode="numeric" aria-label="Capacity" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>min</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="24" inputMode="numeric" aria-label="Quantity" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>pages</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
