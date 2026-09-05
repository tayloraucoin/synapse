import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { LoadingText } from "./loading-text";

const meta: Meta<typeof LoadingText> = {
  title: "Composed/Feedback/LoadingText",
  component: LoadingText,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof LoadingText>;

export const Default: Story = {};

/** ST-10 — the words say it; no spinner, no animated ellipsis. */
export const Export: Story = { args: { label: "Preparing your export" } };
