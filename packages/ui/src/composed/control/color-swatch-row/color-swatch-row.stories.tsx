import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ColorSwatchRow, type ColorSwatchValue } from "./color-swatch-row";

/**
 * The key word is the accessible name of every swatch, and it also shows
 * beneath the row on compact — official spec §9.3, colour never carries
 * meaning alone. Selected is a ring, not a checkmark: a checkmark would sit on
 * eight different backgrounds and be illegible on at least two.
 */
const meta: Meta<typeof ColorSwatchRow> = {
  title: "Composed/Control/ColorSwatchRow",
  component: ColorSwatchRow,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled({ allowNone }: { allowNone?: boolean }) {
  const [value, setValue] = React.useState<ColorSwatchValue>("leaf");
  return (
    <ColorSwatchRow
      label="Colour"
      value={value}
      onChange={setValue}
      allowNone={allowNone}
    />
  );
}

export const EightHues: StoryObj = { render: () => <Controlled /> };

/** The absence of a category is not a ninth category — a dashed ring. */
export const WithNone: StoryObj = { render: () => <Controlled allowNone /> };
