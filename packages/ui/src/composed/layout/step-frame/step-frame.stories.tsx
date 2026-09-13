import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { StepFrame, type StepFrameCopy } from "./step-frame";

/** Story copy — the app's `SETUP_COPY` supplies the real words. */
const COPY: StepFrameCopy = {
  progress: (step, total) => `${step} of ${total}`,
  back: "Back",
  finishLater: "Finish later",
  skip: "Skip for now",
  offline: "Offline — you can look, but changes need a connection.",
};

const meta: Meta<typeof StepFrame> = {
  title: "Composed/Layout/StepFrame",
  component: StepFrame,
  decorators: [
    (Story) => (
      <div className="flex min-h-[480px] max-w-(--content-text) flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    step: 3,
    total: 12,
    heading: "What has to happen before work?",
    body: "The things that are decided, in order, ending when work starts.",
    primary: { label: "Continue", onClick: () => {} },
    onBack: () => {},
    onFinishLater: () => {},
    copy: COPY,
    children: (
      <Text as="p" tone="secondary">
        (the screen&rsquo;s content)
      </Text>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof StepFrame>;

/** *3 of 12*, *Finish later* as ghost text, the heading focused (v1.1 §4). */
export const Middle: Story = {};

/** *Skip for now* as ghost text beside the primary, where skipping is allowed. */
export const WithSkip: Story = { args: { skip: { onSkip: () => {} } } };

/** The first step has no back; *Finish later* is still the exit. */
export const First: Story = { args: { step: 1, onBack: undefined, heading: "Which is closest?" } };

export const Offline: Story = { args: { offline: true, skip: { onSkip: () => {} } } };

export const WithError: Story = { args: { error: "Couldn't save. Nothing changed — try again." } };

export const Busy: Story = {
  args: { primary: { label: "Continue · 6 habits", onClick: () => {}, busy: true } },
};
