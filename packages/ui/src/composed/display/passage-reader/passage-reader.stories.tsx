import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import type { PassageSlide } from "../passage-carousel";
import { PassageReader } from "./passage-reader";

/**
 * The morning reading, full screen (USE-13; D-USE-9). × on the left back to
 * Orient; swipe or the arrow keys for the next passage, the dots follow. The
 * text is capped at the reading measure and centred at every width.
 */
const meta: Meta<typeof PassageReader> = {
  title: "Composed/Display/PassageReader",
  component: PassageReader,
};

export default meta;

const FEET: PassageSlide = {
  kind: "passage",
  id: "feet",
  title: "Where the feet are",
  bodyMd: [
    "Begin where the feet are. The breath has kept time all night without being asked. Before the list and before the clock there is only this: cool air, a held cup, the plain fact of being awake.",
    "Nothing has to be decided yet. The day is already written; it only needs reading, slowly, the way a letter from a friend is read twice. Notice the weight of the body on the seat. Notice the water filling.",
    "When the mind runs ahead to the meeting, the drive, the list, let it go and come back, the way the tide comes back. There is time for all of it, and none of it is now.",
  ].join("\n\n"),
  images: [],
};

const ENOUGH: PassageSlide = {
  kind: "passage",
  id: "enough",
  title: "On enough",
  bodyMd: "Enough is a decision, not a number.",
  images: [],
};

const QUOTE: PassageSlide = {
  kind: "quote",
  id: "quote",
  text: "We suffer more in imagination than in reality.",
  attribution: "Seneca",
};

const LONG: PassageSlide = {
  kind: "passage",
  id: "long",
  title: "A long one",
  bodyMd: Array.from({ length: 6 }, () => FEET.bodyMd).join("\n\n"),
  images: [],
};

function Demo({ passages }: { passages: PassageSlide[] }) {
  const [open, setOpen] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  return (
    <>
      <Button variant="ghost" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Read all
      </Button>
      {open ? (
        <PassageReader
          passages={passages}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setOpen(false)}
          caption="Morning reading"
        />
      ) : null}
    </>
  );
}

type Story = StoryObj<typeof PassageReader>;

export const OnePassage: Story = { render: () => <Demo passages={[FEET]} /> };
export const Several: Story = { render: () => <Demo passages={[FEET, ENOUGH, QUOTE]} /> };
export const LongScrolling: Story = { render: () => <Demo passages={[LONG, FEET]} /> };
