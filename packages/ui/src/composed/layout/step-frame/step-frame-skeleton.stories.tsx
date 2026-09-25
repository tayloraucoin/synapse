import type { Meta, StoryObj } from "@storybook/react";

import { SelectRow, SelectRowList } from "../../control/select-row";
import { StepFrame, type StepFrameCopy } from "./step-frame";
import { StepFrameSkeleton } from "./step-frame-skeleton";

/**
 * The frame, waiting (UX v1.3 R63): the caption, a heading bar, three rows,
 * the action row. What a `/setup/*` route shows while its data arrives, so
 * the sequence never blanks. It should read as waiting, not as a screen.
 */
const meta: Meta<typeof StepFrameSkeleton> = {
  title: "Composed/Layout/StepFrameSkeleton",
  component: StepFrameSkeleton,
  decorators: [
    (Story) => (
      <div className="flex min-h-[480px] max-w-(--content-text) flex-col">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StepFrameSkeleton>;

export const Default: Story = {};

export const WithBodyLine: Story = { args: { body: true } };

const COPY: StepFrameCopy = {
  progress: (step, total) => `${step} of ${total}`,
  back: "Back",
  finishLater: "Finish later",
  skip: "Skip for now",
  offline: "Offline — you can look, but changes need a connection.",
};

/** Side by side with the frame it stands in for: the same geometry, no words. */
export const BesideTheRealFrame: StoryObj = {
  decorators: [
    (Story) => (
      <div className="grid min-h-[480px] grid-cols-1 gap-(--space-6) wide:grid-cols-2">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <div className="flex flex-col">
        <StepFrameSkeleton body />
      </div>
      <div className="flex flex-col">
        <StepFrame
          step={3}
          total={5}
          heading="Which days are work?"
          body="Set each day; the morning is built around it."
          primary={{ label: "Continue", onClick: () => {} }}
          onBack={() => {}}
          onFinishLater={() => {}}
          copy={COPY}
        >
          <SelectRowList>
            <SelectRow icon={{ kind: "emoji", value: "🚿" }} title="Shower" detail="10 min" selected onToggle={() => {}} />
            <SelectRow icon={{ kind: "emoji", value: "☕" }} title="Coffee" detail="10 min" selected={false} onToggle={() => {}} />
            <SelectRow icon={{ kind: "emoji", value: "🧘" }} title="Stretch" detail="5 min" selected={false} onToggle={() => {}} />
          </SelectRowList>
        </StepFrame>
      </div>
    </>
  ),
};
