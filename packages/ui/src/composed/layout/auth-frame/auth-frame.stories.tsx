import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";
import { OAuthButton } from "../../control/oauth-button";
import { AuthFrame } from "./auth-frame";

/**
 * One skeleton for AU-01…05, so five auth screens cannot drift into five
 * layouts. The wordmark is text, not a logo (official spec §9.8).
 */
const meta: Meta<typeof AuthFrame> = {
  title: "Composed/Layout/AuthFrame",
  component: AuthFrame,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof AuthFrame>;

export const SignIn: Story = {
  args: {
    heading: "Sign in",
    trustLine: true,
    children: (
      <>
        <OAuthButton
          provider="google"
          label="Continue with Google"
          onClick={() => {}}
        />
        <Input label="Email" mode="email" />
        <Input label="Password" mode="password" />
        <Button className="w-full">Sign in</Button>
      </>
    ),
    footer: (
      <Text as="p" variant="secondary" tone="secondary">
        No account yet? Create one.
      </Text>
    ),
  },
};

/** A mid-flow screen: the promise has already been made, so no trust line. */
export const Reset: Story = {
  args: {
    heading: "Set a new password",
    lead: "This link works once.",
    children: (
      <>
        <Input label="New password" mode="password" />
        <Button className="w-full">Save</Button>
      </>
    ),
  },
};
