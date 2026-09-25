import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { PriorityMark } from "../../display/priority-mark";
import { SelectRow, SelectRowList } from "./select-row";

/**
 * The row is the selection (UX v1.2 §4): emoji, title, a muted detail; the
 * whole row is the target; selected rows show a tick and an ink border. A
 * `button[aria-pressed]` — never a checkbox.
 *
 * The six states of §10.2 are the six stories below; *Optimistic* has the
 * slow-network and fail controls.
 */
const meta: Meta<typeof SelectRow> = {
  title: "Composed/Control/SelectRow",
  component: SelectRow,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
  args: {
    icon: { kind: "emoji", value: "🚿" },
    title: "Shower",
    detail: "10 min",
    onToggle: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof SelectRow>;

export const Default: Story = { args: { selected: false } };

export const Selected: Story = { args: { selected: true } };

/**
 * UX v1.3 R56 (DAY-1): the one selection grammar beside the screen's primary
 * — a chosen row is surface, a 1.5px ink border and the check; the primary is
 * the only ink fill on the canvas. `LargeTargetRow` draws the same string.
 */
export const SelectedBesideAPrimary: Story = {
  render: (args) => (
    <div className="flex flex-col gap-(--space-5)">
      <SelectRowList>
        <SelectRow {...args} selected />
        <SelectRow {...args} icon={{ kind: "emoji", value: "☕" }} title="Coffee" selected={false} />
      </SelectRowList>
      <div className="flex justify-end">
        <Button>Continue · 1 habit</Button>
      </div>
    </div>
  ),
};

/** The write is out: the border pulses, the row stays tappable. */
export const Saving: Story = { args: { selected: true, committing: true } };

/** The write rejected: the tick reverted, the screen's line reads with the row. */
export const Failed: Story = {
  args: { selected: false, error: "That didn't save. Tap again when you're back online." },
};

/** UX v1.3 R59 (DAY-7): the matters cell between the glyph and the title — the routine's and the pool's rows. */
export const WithLeadingPriorityMark: Story = {
  args: { selected: true, icon: { kind: "emoji", value: "🥶" }, title: "Cold shower", detail: "usually 12", leading: <PriorityMark value={5} /> },
};

/** A 20-character title with the mark at 375px: glyph, mark, title, detail and check on one 56px line. */
export const WithMarkLongTitle375: Story = {
  decorators: [(Story) => <div className="max-w-[375px]"><Story /></div>],
  args: {
    selected: true,
    icon: { kind: "emoji", value: "🔤" },
    title: "Language practice ok",
    detail: "usually 15",
    leading: <PriorityMark value={4} />,
  },
};

export const Disabled: Story = {
  args: { selected: false, disabled: true, disabledCaption: "in your library" },
};

/** Tab to it: the ring, offset by 2px, on the whole row. */
export const FocusVisible: Story = {
  args: { selected: false },
  parameters: { pseudo: { focusVisible: true } },
  render: function Render(args) {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector("button")?.focus();
    }, []);
    return (
      <div ref={ref}>
        <SelectRow {...args} />
      </div>
    );
  },
};

type OptimisticArgs = { slowNetwork: boolean; failCommits: boolean };

/** Tap: the tick lands at once; the border pulses until the write returns; a fail reverts. */
export const Optimistic: StoryObj<OptimisticArgs> = {
  args: { slowNetwork: true, failCommits: false },
  argTypes: {
    slowNetwork: { control: "boolean" },
    failCommits: { control: "boolean" },
  },
  render: function Render(args) {
    const [saved, setSaved] = React.useState(false);
    const [line, setLine] = React.useState<string | null>(null);
    return (
      <SelectRow
        icon={{ kind: "emoji", value: "🧘" }}
        title="Stretch"
        detail="5 min"
        selected={saved}
        onToggle={async (next) => {
          setLine(null);
          await new Promise((resolve) => setTimeout(resolve, args.slowNetwork ? 2000 : 100));
          if (args.failCommits) throw new Error("offline");
          setSaved(next);
        }}
        onCommitError={() => setLine("That didn't save.")}
        error={line}
      />
    );
  },
};

/** The list: one column here, two from the wide breakpoint. */
export const AsAList: StoryObj = {
  render: function Render() {
    const rows = [
      { title: "Shower", icon: "🚿", detail: "10 min" },
      { title: "Coffee", icon: "☕", detail: "10 min" },
      { title: "Stretch", icon: "🧘", detail: "5 min" },
      { title: "Read", icon: "📖", detail: "20 min" },
    ];
    const [picked, setPicked] = React.useState<Set<string>>(new Set(["Coffee"]));
    return (
      <SelectRowList columns={2}>
        {rows.map((row) => (
          <SelectRow
            key={row.title}
            icon={{ kind: "emoji", value: row.icon }}
            title={row.title}
            detail={row.detail}
            selected={picked.has(row.title)}
            onToggle={(next) => {
              setPicked((current) => {
                const out = new Set(current);
                if (next) out.add(row.title);
                else out.delete(row.title);
                return out;
              });
            }}
          />
        ))}
      </SelectRowList>
    );
  },
};
