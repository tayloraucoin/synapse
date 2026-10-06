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

/** UX v1.3 R63 (DAY-2): *Back* tapped — the arrow dims and is `aria-busy` while the previous screen loads. */
export const PendingBack: Story = { args: { pending: "back" } };

/** *Finish later* tapped — the ghost button shows its pending state. */
export const PendingFinishLater: Story = { args: { pending: "finishLater" } };

/**
 * UX v1.2 §4, R43 (RUN-7): three viewports of content; the action row stays
 * pinned above the safe area with a hairline and paper behind it, and the
 * last row is reachable above it. Scroll the story's frame.
 */
export const StickyActionsWithLongContent: Story = {
  decorators: [
    (Story) => (
      <div className="flex h-[480px] max-w-(--content-text) flex-col overflow-y-auto p-(--space-4)">
        <Story />
      </div>
    ),
  ],
  args: {
    total: 14,
    children: (
      <ol className="m-0 flex list-decimal flex-col gap-(--space-3) ps-(--space-5)">
        {Array.from({ length: 40 }, (_, index) => (
          <li key={index}>
            <Text as="span" tone="secondary">
              Row {index + 1} of the screen&rsquo;s content
            </Text>
          </li>
        ))}
      </ol>
    ),
  },
};

/** The row in flow, for a screen whose layout pins its own. */
export const ActionsInFlow: Story = { args: { stickyActions: false } };

/** UX v1.2 §4.13 (RUN-12): the day builder's second caption under the progress line. */
export const WithCaption: Story = {
  args: { step: 4, total: 5, caption: "Day A · 4 of 17", heading: "Train on this day?" },
};

/**
 * UX v1.3 §4 (DAY-9): the builder's *Back* on the action row's left, beside
 * the screen's own ghost and the primary — forward and back in thumb reach.
 */
export const BackOnActionRow: Story = {
  args: {
    step: 4,
    total: 5,
    caption: "Day A · 4 of 17",
    heading: "Train on this day?",
    backOnActionRow: true,
    skip: { label: "Not on this day", onSkip: () => {} },
    primary: { label: "Next", onClick: () => {} },
  },
};
