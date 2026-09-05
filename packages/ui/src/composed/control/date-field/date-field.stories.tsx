import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DateField } from "./date-field";

/**
 * WK-03's *Day*, and nowhere else in Phase 1. Native `type="date"` — §2.6
 * rules out `calendar` and `date-picker`, and one field on one screen does not
 * earn a picker.
 */
const meta: Meta<typeof DateField> = {
  title: "Composed/Control/DateField",
  component: DateField,
  decorators: [(Story) => <div className="max-w-xs p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("2026-09-04");
    return <DateField label="Day" value={value} onChange={setValue} />;
  },
};
