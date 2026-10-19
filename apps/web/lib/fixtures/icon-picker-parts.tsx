"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import type { IconPickerInitial } from "@syn/ui";
import { IconPickerStep } from "@/components/planner/icon-picker-step";
import type { RecentPicks } from "@/lib/hooks/use-recent-picks";
import { fixtureId } from "./ids";

/**
 * USE-11's six drawn states on `/dev/parts?state=icon-picker-<state>`: the
 * picker as a step inside a 402-wide sheet, opened from "Meditate" (or the
 * add sheet, with no name yet), on the default scenario's saved colours. A
 * pick or a back here stays on the step, so a capture can show it.
 */

export type IconPickerPartState =
  | "emoji-suggested"
  | "no-name-yet"
  | "icon-tab"
  | "custom-colour"
  | "bad-hex"
  | "saved-colours";

/** The boards' Recent row, until this device has picks of its own. */
const RECENT: RecentPicks = {
  emoji: ["💧", "🛁", "⚖️", "🏋️", "🚗", "🍳", "🔄", "📞"],
  icon: [],
};

const MEDITATING: IconValue = { kind: "emoji", value: "🧘" };
/** The newest saved colour in the default scenario, picked. */
const LEAF: IconValue = { kind: "lucide", value: "leaf", color: "#2f6f62" };
const DARK_GREEN = fixtureId(9, 4);

const STATES: Record<
  IconPickerPartState,
  { name: string; back: string; value: IconValue; initial: IconPickerInitial }
> = {
  "emoji-suggested": {
    name: "Meditate",
    back: "Meditate",
    value: MEDITATING,
    initial: { tab: "emoji" },
  },
  "no-name-yet": {
    name: "",
    back: "Add to Wellness",
    value: MEDITATING,
    initial: { tab: "emoji" },
  },
  "icon-tab": {
    name: "Meditate",
    back: "Meditate",
    value: LEAF,
    initial: { tab: "icon" },
  },
  "custom-colour": {
    name: "Meditate",
    back: "Meditate",
    value: LEAF,
    initial: { tab: "icon", panel: { kind: "custom" } },
  },
  "bad-hex": {
    name: "Meditate",
    back: "Meditate",
    value: LEAF,
    initial: { tab: "icon", panel: { kind: "custom" }, hexText: "2F6G6" },
  },
  "saved-colours": {
    name: "Meditate",
    back: "Meditate",
    value: LEAF,
    initial: {
      tab: "icon",
      editing: true,
      panel: { kind: "edit", id: DARK_GREEN },
    },
  },
};

export function IconPickerPart({ state }: { state: IconPickerPartState }) {
  const drawn = STATES[state];
  const [value, setValue] = React.useState<IconValue>(drawn.value);
  return (
    <div className="wide:p-(--space-4) flex flex-1 justify-center">
      <section
        aria-label="Sheet"
        className="border-hairline bg-paper flex h-[760px] w-full max-w-[402px] flex-col rounded-t-(--radius-sheet) border px-(--space-4) pt-(--space-4)"
      >
        <IconPickerStep
          name={drawn.name}
          value={value}
          backLabel={drawn.back}
          onPick={setValue}
          onRecolour={setValue}
          onBack={() => setValue(drawn.value)}
          initial={{ ...drawn.initial, recent: RECENT }}
        />
      </section>
    </div>
  );
}
