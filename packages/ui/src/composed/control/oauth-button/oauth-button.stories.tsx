import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { OAuthButton } from "./oauth-button";

/**
 * Secondary at full width — no brand fill, because a blue button would be the
 * loudest thing on a screen whose primary action is *Sign in*. The mark is
 * inline SVG: Google's guidelines require the four-colour mark unmodified, and
 * a Lucide approximation would be neither correct nor licensed.
 */
const meta: Meta<typeof OAuthButton> = {
  title: "Composed/Control/OAuthButton",
  component: OAuthButton,
  args: { provider: "google", label: "Continue with Google", onClick: () => {} },
  decorators: [(Story) => <div className="max-w-sm p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof OAuthButton>;

export const Default: Story = {};

/** The spinner is on this button only — two at once says nothing useful. */
export const Busy: Story = { args: { busy: true } };

export const Disabled: Story = { args: { disabled: true } };
