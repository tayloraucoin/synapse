import type { Meta, StoryObj } from "@storybook/react";

import { NativeSelect, NativeSelectOption } from "./native-select";

const meta: Meta<typeof NativeSelect> = {
  title: "Primitives/Control/NativeSelect",
  component: NativeSelect,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

/** The OS picker — right where a phone's wheel is better than a menu. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-sm flex-col gap-(--space-4) p-(--space-6)">
      <NativeSelect aria-label="Weekday" defaultValue="mon">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <NativeSelectOption key={day} value={day.toLowerCase()}>
            {day}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect aria-label="Disabled" disabled>
        <NativeSelectOption value="a">Unavailable</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};
