import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { RegionRetry } from "./region-retry";

/**
 * Containment: one failed query must not replace a page whose other panels
 * loaded and are still true. No error code in the copy — the code is logged
 * (nav & system SY-05).
 */
const meta: Meta<typeof RegionRetry> = {
  title: "Composed/Feedback/RegionRetry",
  component: RegionRetry,
  args: { onRetry: () => {} },
  decorators: [(Story) => <div className="max-w-xl p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj<typeof RegionRetry> = {
  args: { label: "This week didn't load." },
};
