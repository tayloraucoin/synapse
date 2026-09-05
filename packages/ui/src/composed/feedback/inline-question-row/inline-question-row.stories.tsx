import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { InlineQuestionRow } from "./inline-question-row";

/**
 * Replaces the sheet's footer rather than opening a dialog: a dialog over a
 * sheet is two modal layers for one question.
 */
const meta: Meta<typeof InlineQuestionRow> = {
  title: "Composed/Feedback/InlineQuestionRow",
  component: InlineQuestionRow,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
};

export default meta;

export const SameStart: StoryObj<typeof InlineQuestionRow> = {
  args: {
    text: "Stretch already starts at 7:00. Do both at once?",
    primary: { label: "Both at once", onClick: () => {} },
    secondary: { label: "One after the other", onClick: () => {} },
  },
};
