import type { Meta, StoryObj } from "@storybook/react";

import { ErrorPage } from "./error-page";

/**
 * SY-05, both variants. Never a stack trace, never a code — the code is
 * logged, not shown. Neither apologises: an apology in an error page is the
 * app talking about itself.
 */
const meta: Meta<typeof ErrorPage> = {
  title: "Composed/Layout/ErrorPage",
  component: ErrorPage,
  parameters: { layout: "fullscreen" },
  args: { onOpenToday: () => {} },
};

export default meta;

type Story = StoryObj<typeof ErrorPage>;

export const NotFound: Story = { args: { variant: "not-found" } };

export const Unrecoverable: Story = {
  args: { variant: "unrecoverable", onReload: () => {} },
};
