import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { LinkCallout } from "./link-callout";

/**
 * A thing to open, on the orient frame (UX v1.3 R53): surface and hairline,
 * 56px at least, the mark, the title over the host, the external glyph. It
 * opens in a new tab and fetches nothing — the network panel stays empty.
 */
const meta: Meta<typeof LinkCallout> = {
  title: "Composed/Display/LinkCallout",
  component: LinkCallout,
  decorators: [(Story) => <div className="max-w-[375px] p-(--space-6)"><Story /></div>],
  args: {
    title: "Focus",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
    host: "open.spotify.com",
    kind: "spotify",
  },
};

export default meta;

type Story = StoryObj<typeof LinkCallout>;

export const Spotify: Story = {};

export const OtherHost: Story = {
  args: { title: "Morning notes", url: "https://example.com/notes", host: "example.com", kind: "other" },
};

/** Two under the reading, as the frame stacks them. */
export const TwoStacked: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--space-2)">
      <LinkCallout {...args} />
      <LinkCallout title="Morning notes" url="https://example.com/notes" host="example.com" kind="other" />
    </div>
  ),
};

/** Hover darkens the surface one neutral step. */
export const Hover: Story = { parameters: { pseudo: { hover: true } } };

/** Tab to it: the ring, offset by 2px. */
export const FocusVisible: Story = {
  render: function Render(args) {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector("a")?.focus();
    }, []);
    return (
      <div ref={ref}>
        <LinkCallout {...args} />
      </div>
    );
  },
};

export const LongTitleTruncates: Story = {
  args: { title: "Deep Focus — two hours of instrumental music for the first thing in the morning" },
};

/** No host: the title alone. */
export const NoHost: Story = { args: { host: "" } };
