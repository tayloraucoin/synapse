import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ThemeProvider } from "../../../providers/theme-provider";
import { Caption } from "../../../primitives/typography/text";
import { ThemeControl } from "./theme-control";

/**
 * Selecting a row writes `<html class="dark">` (or removes it) immediately —
 * there is no save button (Epic 1 ST-09). The story prints the live class list
 * so the effect is observable rather than asserted.
 *
 * Storybook's own theme toolbar also writes that class, so the two will fight:
 * whichever acted last wins. That is expected here and does not happen in the
 * app, where the control is the only writer.
 */
function RootClassReadout() {
  const [classes, setClasses] = React.useState("");

  React.useEffect(() => {
    const read = () =>
      setClasses(document.documentElement.className || "(none)");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Caption as="p" tone="muted">
      &lt;html class=&quot;{classes}&quot;&gt;
    </Caption>
  );
}

const meta: Meta<typeof ThemeControl> = {
  title: "Composed/Control/ThemeControl",
  component: ThemeControl,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="flex max-w-md flex-col gap-(--space-4) p-(--space-6)">
          <Story />
          <RootClassReadout />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ThemeControl>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    label: "Theme",
    helperText: "Applies right away.",
  },
};
