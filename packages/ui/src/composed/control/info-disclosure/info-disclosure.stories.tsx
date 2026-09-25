import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { InfoDisclosure, type InfoDisclosureItem } from "./info-disclosure";

/**
 * Every "what does this do?" (UX v1.3 R60): the info glyph and a label;
 * open, a surface panel of term-and-definition lines. Fixture text is screen
 * 3's five lines (v1.3 §4.3); the app's `copy.ts` supplies the real words.
 */
const FIVE: InfoDisclosureItem[] = [
  { term: "Always", text: "a work day. The morning is built around it." },
  { term: "Usually", text: "a work day, most weeks. “Not working today” is one tap away in the day’s menu." },
  { term: "Sometimes", text: "the morning asks, “Working today?” and builds from the answer." },
  { term: "Rarely", text: "planned as a day off. “Working today” is one tap away in the day’s menu if it turns out otherwise." },
  { term: "Never", text: "a day off. Nothing about work is asked." },
];

const meta: Meta<typeof InfoDisclosure> = {
  title: "Composed/Control/InfoDisclosure",
  component: InfoDisclosure,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
  args: {
    label: "What does each choice do?",
    items: FIVE,
    onToggle: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof InfoDisclosure>;

/** The glyph and the label at secondary size; nothing below. */
export const Collapsed: Story = { args: { expanded: false } };

/** The surface panel: the term in weight 500, the definition in the secondary tone. */
export const ExpandedFiveItems: Story = { args: { expanded: true } };

/**
 * Tab to the button; Enter (or Space, or a click) toggles `aria-expanded`
 * and focus stays on the button.
 */
export const Keyboard: Story = {
  render: function Render(args) {
    const [expanded, setExpanded] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector("button")?.focus();
    }, []);
    return (
      <div ref={ref}>
        <InfoDisclosure {...args} expanded={expanded} onToggle={setExpanded} />
      </div>
    );
  },
};

/** No items: the button alone, with nothing to open. */
export const NoItems: Story = { args: { expanded: true, items: [] } };
