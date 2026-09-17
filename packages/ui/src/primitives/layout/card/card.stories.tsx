import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../control/button";
import { Text } from "../../typography/text";
import { EmojiSlot } from "../../../composed/display/emoji-slot";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

/**
 * The setup card's base (UX v1.2 §4): `bg-surface`, a hairline, 16px padding,
 * flat on the page. The header carries the person's emoji in the 44px card slot and
 * the title as the accessible name; the trailing slot is a text button.
 */
const meta: Meta<typeof Card> = {
  title: "Primitives/Layout/Card",
  component: Card,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <Text as="p">A card with nothing but a paragraph.</Text>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <EmojiSlot icon={{ kind: "emoji", value: "🏋️" }} size="card" />
        <div className="flex min-w-0 flex-1 flex-col">
          <CardTitle>Lift</CardTitle>
          <CardDescription>Gym · 60 min · travel 15 there, 15 back</CardDescription>
        </div>
        <CardAction>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text as="p" tone="secondary">
          The card&rsquo;s content &mdash; the feature folder&rsquo;s fields go here.
        </Text>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm">
          Remove
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** Collapsed: one line and *Edit*. The fold itself is the feature folder's. */
export const CollapsedSummary: Story = {
  render: () => (
    <Card className="py-(--space-2)">
      <CardHeader>
        <EmojiSlot icon={{ kind: "emoji", value: "☕" }} size="card" />
        <div className="flex min-w-0 flex-1 items-baseline gap-(--space-2)">
          <CardTitle className="truncate">Coffee</CardTitle>
          <Text as="span" variant="secondary" tone="secondary" className="shrink-0 tabular-nums">
            10 min
          </Text>
        </div>
        <CardAction>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  ),
};
