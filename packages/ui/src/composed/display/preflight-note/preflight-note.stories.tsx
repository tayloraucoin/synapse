import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { PreflightNote } from "./preflight-note";

const meta: Meta<typeof PreflightNote> = {
  title: "Composed/Display/PreflightNote",
  component: PreflightNote,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

/** The person's own words, quoted back — not an instruction from the app. */
export const Default: StoryObj<typeof PreflightNote> = {
  args: {
    children: "Phone in the other room. Start with the outline, not the intro.",
  },
};
