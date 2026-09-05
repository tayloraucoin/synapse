import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { REASONS } from "../../__fixtures__/view-models";
import { ReasonChips } from "./reason-chips";

/**
 * *Other* reveals a short field — maxlength 80, because a reason is a few
 * words ("car wouldn't start"), not a paragraph. The note field, where a
 * paragraph belongs, is a separate control at 280.
 */
const meta: Meta<typeof ReasonChips> = {
  title: "Composed/Control/ReasonChips",
  component: ReasonChips,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    const [other, setOther] = React.useState("");
    return (
      <ReasonChips
        label="Reason"
        reasons={REASONS.scoping}
        value={value}
        onChange={setValue}
        otherText={other}
        onOtherTextChange={setOther}
        onKeepReason={() => {}}
      />
    );
  },
};

export const OtherSelected: StoryObj = {
  render: function Render() {
    const [other, setOther] = React.useState("car wouldn't start");
    return (
      <ReasonChips
        label="Reason"
        reasons={REASONS.circumstance}
        value="other"
        onChange={() => {}}
        otherText={other}
        onOtherTextChange={setOther}
        onKeepReason={() => {}}
      />
    );
  },
};
