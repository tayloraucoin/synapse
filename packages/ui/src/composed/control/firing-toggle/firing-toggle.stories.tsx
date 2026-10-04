import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { FiringToggle, type FiringToggleProps } from "./firing-toggle";

/**
 * The 44px toggle. Off is a ring; on is the breathing mark. Pressing reports
 * the wanted state and changes nothing itself — the Overview wires it to local
 * state so it can be tried.
 */
const meta: Meta<typeof FiringToggle> = {
  title: "Composed/Control/FiringToggle",
  component: FiringToggle,
  args: { pressed: false, label: "Fire Draft the onboarding email", onPressedChange: () => {} },
};

export default meta;

type Story = StoryObj<typeof FiringToggle>;

export const Off: Story = {};

export const On: Story = {
  args: { pressed: true, label: "Mark Draft the onboarding email back" },
};

export const Disabled: Story = { args: { disabled: true } };

function Focused(props: FiringToggleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector("button")?.focus({ focusVisible: true } as FocusOptions);
  }, []);
  return (
    <div ref={ref}>
      <FiringToggle {...props} />
    </div>
  );
}

function Tryable(props: FiringToggleProps) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <FiringToggle
      {...props}
      pressed={pressed}
      label={pressed ? "Mark Draft the onboarding email back" : "Fire Draft the onboarding email"}
      onPressedChange={setPressed}
    />
  );
}

/** Tab to the control: the product's ring, on the control. */
export const FocusVisible: Story = { render: (args) => <Focused {...args} /> };

export const Interactive: Story = { render: (args) => <Tryable {...args} /> };
