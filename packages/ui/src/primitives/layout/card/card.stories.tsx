import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../control/button";
import { Text } from "../../typography/text";
import { EmojiSlot } from "../../../composed/display/emoji-slot";
import { PriorityMark } from "../../../composed/display/priority-mark";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { CardSummary } from "./card-summary";

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

/** v1.2's one line, kept for comparison; v1.3 R57 is `CardSummary` below. */
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

const edit = (
  <Button variant="ghost" size="sm">
    Edit
  </Button>
);

/** UX v1.3 R57 (DAY-1): collapsed to two lines — glyph · title · *Edit*, then the facts. */
export const CollapsedTwoLinesShort: Story = {
  render: () => (
    <Card className="max-w-[375px] py-(--space-2)">
      <CardSummary
        leading={<EmojiSlot icon={{ kind: "emoji", value: "☕" }} size="card" />}
        title="Coffee"
        caption="usually 10 min · 5 to 15"
        action={edit}
      />
    </Card>
  ),
};

/**
 * A 90-character caption at 375px wraps to two lines and clamps; *Edit*
 * stays on the first line. The matters mark sits beside the glyph (R59).
 */
export const CollapsedTwoLinesLongCaption: Story = {
  render: () => (
    <Card className="max-w-[375px] py-(--space-2)">
      <CardSummary
        leading={
          <>
            <EmojiSlot icon={{ kind: "emoji", value: "🧘" }} size="card" />
            <PriorityMark value={5} />
          </>
        }
        title="Stretch"
        caption="usually 12 min · 5 to 20 · Short: 5 min · Long: 20 min · before the shower, after coffee, most days"
        action={edit}
      />
    </Card>
  ),
};

/** A 60-character title truncates with an ellipsis; nothing else on the first line does. */
export const CollapsedLongTitleTruncates: Story = {
  render: () => (
    <Card className="max-w-[375px] py-(--space-2)">
      <CardSummary
        leading={<EmojiSlot icon={{ kind: "emoji", value: "🏋️" }} size="card" />}
        title="Upper body at the community centre gym, with the long warm-up"
        caption="Gym · 60 min · travel 15 there, 15 back"
        action={edit}
      />
    </Card>
  ),
};
