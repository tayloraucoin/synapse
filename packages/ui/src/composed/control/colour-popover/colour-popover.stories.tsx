import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../../primitives/control/button";
import { ColourPopover } from "./colour-popover";

/**
 * The custom colour (USE-11, D-USE-35): swatch, hex, saturation area and hue
 * slider. A bad hex keeps the old colour and shows N2's words in ink.
 */
const meta: Meta<typeof ColourPopover> = {
  title: "Composed/Control/ColourPopover",
  component: ColourPopover,
  decorators: [
    (Story) => (
      <div className="max-w-[402px] p-(--space-6)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const HELPER = "Drag to pick, or type a hex.";

function Controlled({ defaultHexText }: { defaultHexText?: string }) {
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState("#2f6f62");
  return (
    <ColourPopover
      open={open}
      onOpenChange={setOpen}
      value={value}
      onChange={setValue}
      helper={HELPER}
      defaultHexText={defaultHexText}
    >
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Colour
      </Button>
    </ColourPopover>
  );
}

export const Open: StoryObj = { render: () => <Controlled /> };

/** "2F6G6": an ink edge, N2's words, and the swatch keeps #2F6F62. */
export const BadHex: StoryObj = {
  render: () => <Controlled defaultHexText="2F6G6" />,
};
