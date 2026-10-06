import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { PassageCarousel, type PassageSlide } from "./passage-carousel";

/**
 * The orient frame's reading (UX v1.2 §5.2): one passage at a time, dots
 * beneath. Swipe 40px, or focus the region and use the arrow keys; the dots
 * are tabs. A 200ms translate settles a move; under reduced motion the slides
 * crossfade.
 */
const meta: Meta<typeof PassageCarousel> = {
  title: "Composed/Display/PassageCarousel",
  component: PassageCarousel,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

const PASSAGES: PassageSlide[] = [
  {
    kind: "passage",
    id: "a",
    title: "On beginning",
    bodyMd: "The morning is the day's first draft.\n\n> What you do first, you do *before* the day has an opinion about it.",
    images: [],
  },
  {
    kind: "passage",
    id: "b",
    title: "On attention",
    bodyMd: "- Notice one thing.\n- Then the next.\n- Then **stop counting**.",
    images: ["cover"],
  },
  {
    kind: "passage",
    id: "c",
    title: "On enough",
    bodyMd: "Enough is a decision, not a number.",
    images: [],
  },
];

const QUOTE: PassageSlide = {
  kind: "quote",
  id: "q",
  text: "We suffer more in imagination than in reality.",
  attribution: "Seneca",
};

/** An outlined placeholder so the image slot lays out without a bucket (no colour — the app has no hex outside the preset). */
const PIXEL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect x="1" y="1" width="638" height="318" fill="none" stroke="currentColor" stroke-dasharray="6 6"/></svg>',
  );

function Demo({ slides }: { slides: PassageSlide[] }) {
  const [index, setIndex] = React.useState(0);
  return (
    <PassageCarousel
      slides={slides}
      index={index}
      onIndexChange={setIndex}
      resolveImageUrl={() => PIXEL}
      empty={
        <Text as="p" tone="secondary">
          Nothing to read yet.
        </Text>
      }
    />
  );
}

export const One: StoryObj = { render: () => <Demo slides={PASSAGES.slice(0, 1)} /> };

export const Many: StoryObj = { render: () => <Demo slides={PASSAGES} /> };

export const QuoteDay: StoryObj = { render: () => <Demo slides={[QUOTE]} /> };

export const Empty: StoryObj = { render: () => <Demo slides={[]} /> };

/** Under `prefers-reduced-motion` the move is a crossfade, never a slide. */
export const ReducedMotion: StoryObj = {
  render: () => <Demo slides={PASSAGES} />,
  parameters: { docs: { description: { story: "Toggle reduced motion in the OS or DevTools." } } },
};
