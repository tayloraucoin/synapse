import { TIMEZONE_REGIONS } from "@syn/constants";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimezoneSelect } from "./timezone-select";

/**
 * Two presentations for one control. Resize across 768px: a native `select`
 * on compact, where the OS wheel handles hundreds of options better than
 * anything in a webview, and a searchable `PickerList` on wide.
 *
 * The zone list is a prop — content from `@syn/constants`, not a decision this
 * component makes (§11).
 */
const meta: Meta<typeof TimezoneSelect> = {
  title: "Composed/Control/TimezoneSelect",
  component: TimezoneSelect,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("America/Vancouver");
    return (
      <TimezoneSelect
        label="Time zone"
        zones={TIMEZONE_REGIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
};
