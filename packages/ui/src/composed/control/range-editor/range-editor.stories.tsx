import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { RangeEditor, type RangeEditorValue } from "./range-editor";

/**
 * *from · to · min* on one 44px line, right-aligned (UX v1.2 §10.2). Type a
 * *to* under the *from*: the sentence appears in ink and nothing is clamped
 * (R21). At 200% text *to* stacks under *from*; nothing scrolls sideways at
 * 375px.
 */
const meta: Meta<typeof RangeEditor> = {
  title: "Composed/Control/RangeEditor",
  component: RangeEditor,
  decorators: [(Story) => <div className="max-w-[343px] p-(--space-4)"><Story /></div>],
};

export default meta;

function Controlled(props: { initial: RangeEditorValue; error?: string; disabled?: boolean }) {
  const [value, setValue] = React.useState(props.initial);
  return (
    <RangeEditor
      label="Takes"
      value={value}
      onChange={setValue}
      error={props.error}
      disabled={props.disabled}
    />
  );
}

export const Default: StoryObj = { render: () => <Controlled initial={{ from: 10, to: 20 }} /> };

/** Focus the second field and type: the row is the editor; there is no open state to leave. */
export const Editing: StoryObj = { render: () => <Controlled initial={{ from: 10, to: null }} /> };

/** *to* under *from*: the sentence, in ink. */
export const Invalid: StoryObj = { render: () => <Controlled initial={{ from: 30, to: 10 }} /> };

/** The caller's own sentence wins over the built-in one. */
export const CallerError: StoryObj = {
  render: () => <Controlled initial={{ from: null, to: null }} error="Say how long this usually takes." />,
};

export const Disabled: StoryObj = {
  render: () => <Controlled initial={{ from: 10, to: 20 }} disabled />,
};

/** Tab into the first field: the ring on the field, the row unchanged. */
export const FocusVisible: StoryObj = {
  render: function Render() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector("input")?.focus();
    }, []);
    return (
      <div ref={ref}>
        <Controlled initial={{ from: 10, to: 20 }} />
      </div>
    );
  },
};
