import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SearchField } from "./search-field";

/**
 * The clear control is a real button at a 44px target that returns focus to
 * the input — clearing a search should not drop a person out of the field
 * they are typing in.
 */
const meta: Meta<typeof SearchField> = {
  title: "Composed/Control/SearchField",
  component: SearchField,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <SearchField
        aria-label="Search habits"
        placeholder="Search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue("")}
      />
    );
  },
};

/** T13.2 (DAY-1): the value sits `--space-3` clear of the glyph's slot and never touches the border. */
export const WithValue: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("morning");
    return (
      <SearchField
        aria-label="Search habits"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue("")}
      />
    );
  },
};

export const Disabled: StoryObj<typeof SearchField> = {
  args: { "aria-label": "Search habits", value: "morning", disabled: true },
};
