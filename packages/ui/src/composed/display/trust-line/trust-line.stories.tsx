import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TrustLine } from "./trust-line";

/**
 * The text is fixed. There is no `children` prop, because a trust line that
 * can be reworded per screen is not a promise.
 */
const meta: Meta<typeof TrustLine> = {
  title: "Composed/Display/TrustLine",
  component: TrustLine,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj<typeof TrustLine> = {};
