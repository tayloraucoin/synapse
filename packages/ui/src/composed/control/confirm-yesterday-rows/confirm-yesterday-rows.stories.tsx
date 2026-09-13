import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { LAST_NIGHT } from "../../__fixtures__/view-models";
import { ConfirmYesterdayRows } from "./confirm-yesterday-rows";
import { CONFIRM_YESTERDAY_COPY } from "./copy";

const meta: Meta<typeof ConfirmYesterdayRows> = {
  title: "Composed/Control/ConfirmYesterdayRows",
  component: ConfirmYesterdayRows,
};

export default meta;

type Story = StoryObj<typeof ConfirmYesterdayRows>;

/** Two rows, none ticked — never pre-ticked (§7.3). */
export const Pending: Story = {
  render: function Render() {
    const [checked, setChecked] = React.useState<string[]>([]);
    return (
      <ConfirmYesterdayRows
        items={LAST_NIGHT}
        checked={checked}
        caption={CONFIRM_YESTERDAY_COPY.caption}
        onChange={(id, on) =>
          setChecked((current) => (on ? [...current, id] : current.filter((x) => x !== id)))
        }
      />
    );
  },
};

export const OneTicked: Story = {
  args: {
    items: LAST_NIGHT,
    checked: [LAST_NIGHT[0]?.id ?? ""],
    caption: CONFIRM_YESTERDAY_COPY.caption,
    onChange: () => {},
  },
};

/** Nothing to confirm renders nothing — the section is absent (§5.3). */
export const None: Story = {
  args: { items: [], checked: [], caption: CONFIRM_YESTERDAY_COPY.caption, onChange: () => {} },
};
