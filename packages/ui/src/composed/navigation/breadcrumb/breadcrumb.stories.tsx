import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../../primitives/typography/text";
import { Breadcrumb } from "./breadcrumb";

/**
 * The way back from a focused screen (D-USE-10): the chevron and the place,
 * muted, over the title. Its accessible name says "Back to <place>".
 */
const meta: Meta<typeof Breadcrumb> = {
  title: "Composed/Navigation/Breadcrumb",
  component: Breadcrumb,
  args: { label: "Orient", href: "#", ariaLabel: "Back to Orient" },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

/** As Review the day draws it: 2 px over the date title. */
export const OverTitle: Story = {
  render: (args) => (
    <header className="flex flex-col gap-0.5">
      <Breadcrumb {...args} />
      <Text as="h1" variant="heading">
        Monday, 12 October
      </Text>
    </header>
  ),
};
