import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Control/Input",
  component: Input,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Input>;

const MODES = ["text", "email", "password", "number", "time", "date"] as const;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-sm flex-col gap-(--space-5) p-(--space-6)">
      {MODES.map((mode) => (
        <Input
          key={mode}
          mode={mode}
          label={mode}
          helperText={`mode="${mode}"`}
          placeholder={mode === "text" ? "Immediate wake up" : undefined}
        />
      ))}
      <Input
        label="Habit name"
        error="Give it a name."
        placeholder="Immediate wake up"
      />
      <Input label="Habit name" value="Immediate wake up" disabled readOnly />
    </div>
  ),
};

/** Show/Hide is a text button at a 44px target, never an eye icon. */
export const Password: Story = {
  args: {
    mode: "password",
    label: "Password",
    helperText: "Passwords need at least 8 characters.",
  },
  render: (args) => (
    <div className="max-w-sm p-(--space-6)">
      <Input {...args} />
    </div>
  ),
};

/** UX v1.3 §4.4 B8 (DAY-10): the `LinkSheet`'s field — `type="url"`, the URL keyboard, no autocorrect. */
export const Url: Story = {
  args: { label: "Link", mode: "url", placeholder: "https://…", error: "That link doesn't look right." },
  render: (args) => (
    <div className="max-w-sm p-(--space-6)">
      <Input {...args} />
    </div>
  ),
};

/** Error is a 1px ink border and an ink line. Never red (§9.3). */
export const WithError: Story = {
  args: { label: "Email", mode: "email", error: "That doesn't look like an email address." },
  render: (args) => (
    <div className="max-w-sm p-(--space-6)">
      <Input {...args} />
    </div>
  ),
};
