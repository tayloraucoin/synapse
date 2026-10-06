import type { BlockKind } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { BlockHeader } from "./block-header";
import { BLOCK_KIND_WORDS } from "./copy";

const meta: Meta<typeof BlockHeader> = {
  title: "Composed/Display/BlockHeader",
  component: BlockHeader,
};

export default meta;

type Story = StoryObj<typeof BlockHeader>;

/** *Morning · 7:03–8:11* — the name and the computed span (v1.1 §6.1). */
export const WithSpan: Story = {
  args: {
    kind: "morning",
    name: "Morning",
    span: { startLabel: "7:03", endLabel: "8:11" },
  },
};

/** An unstructured day's block, or one that has no times yet (§10.2 *no-span*). */
export const NoSpan: Story = {
  args: { kind: "wind_down", name: null, span: null },
};

/** A work container split around training: one header per half (§6.1). */
export const Split: StoryObj = {
  render: () => (
    <div className="flex flex-col">
      <BlockHeader kind="work" name="Work" split span={{ startLabel: "9:00", endLabel: "11:00" }} />
      <BlockHeader kind="training" name={null} span={{ startLabel: "11:00", endLabel: "12:00" }} />
      <BlockHeader kind="work" name="Work" split span={{ startLabel: "12:00", endLabel: "17:30" }} />
    </div>
  ),
};

/** Every kind's default word, when the block carries no template name. */
export const EveryKind: StoryObj = {
  render: () => (
    <div className="flex flex-col">
      {(Object.keys(BLOCK_KIND_WORDS) as BlockKind[]).map((kind) => (
        <BlockHeader key={kind} kind={kind} name={null} span={null} />
      ))}
    </div>
  ),
};
