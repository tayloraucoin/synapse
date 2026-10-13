import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CountdownFace } from "./countdown-face";

/**
 * The running card's face. Counting down in ink; under a minute over in
 * warning; a minute or more over in danger; the word "over" always beside the
 * figure (D-USE-29).
 */
const meta: Meta<typeof CountdownFace> = {
  title: "Composed/Display/CountdownFace",
  component: CountdownFace,
  decorators: [
    (Story) => (
      <div className="p-(--space-8)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CountdownFace>;

function formatLeft(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** A live countdown from 1:24:10, one tick a second, as the card's hook drives it. */
function CountingDownDemo() {
  const [left, setLeft] = React.useState(5050);
  React.useEffect(() => {
    const id = window.setInterval(
      () => setLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);
  return <CountdownFace figure={formatLeft(left)} />;
}

export const CountingDown: Story = { render: () => <CountingDownDemo /> };

export const UnderAMinuteOver: Story = {
  args: { figure: "0:42", over: { word: "over", level: "warning" } },
};

export const WellOver: Story = {
  args: { figure: "12 min", over: { word: "over", level: "danger" } },
};
