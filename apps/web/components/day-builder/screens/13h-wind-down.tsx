"use client";

import * as React from "react";

import { PLACED_ROW_ICONS } from "@syn/constants";
import type { HabitSummaryView, SlotView } from "@syn/types";
import { Button, ListRow, Text } from "@syn/ui";

import { QuickHabitSheet } from "@/components/habit-sheet";
import { trpc } from "@/lib/trpc/client";

import { display, minutesOf, toInputClock } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { SlotRows, type PlacedRow } from "../slot-rows";
import { totalOf, type DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";

/** The journal's length on the walk (v1.2 §4.11: *around 10 minutes*). */
export const JOURNAL_MIN = 10;

function midpointOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 10;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

/**
 * 13h — winding down (UX v1.2 §4.13h, v1.1 §7.1).
 *
 * THE LIST IS THE WIND-DOWN TEMPLATE's SLOTS, seeded on a new list from
 * screen 11's habits at their midpoints. The two placed rows and lights out
 * are the plan's times, never slots — DYN-18 places them at
 * materialisation — so they render in position, muted, without a handle.
 *
 * AFTER PHONE AWAY is a pin: a habit moved below *Phone away* is written
 * with `pinned_clock` at phone away (the walk's own way to say *after the
 * pin*) and reads *confirm in the morning*; the menu moves it either way.
 */
export function ScreenWindDown({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const utils = trpc.useUtils();
  const candidates = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "wind_down"), [api]);
  const seed = React.useCallback(
    () => candidates.map((habit) => ({ habitId: habit.id, durationMin: midpointOf(habit), scheduling: "soft" as const })),
    [candidates],
  );
  const list = useListScreen({ api, kind: "wind_down", fk: "windDownTemplateId", defaultName: COPY.h.defaultName, seed });
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const lightsOut = minutesOf(api.times.lightsOut);
  const phoneAway = minutesOf(api.times.devicesOff);
  const phoneAwayInput = toInputClock(api.times.devicesOff);

  const slots = React.useMemo(() => (list.slots ?? []).filter((slot) => slot.role !== "pool"), [list.slots]);
  const before = slots.filter((slot) => slot.pinnedClock === null);
  const total = totalOf(before);

  const starts = phoneAway === null ? null : display(phoneAway - JOURNAL_MIN - total);
  const lastBefore = slots.reduce((last, slot, index) => (slot.pinnedClock === null ? index : last), -1);
  const placed: PlacedRow[] = [
    { key: "journal", icon: PLACED_ROW_ICONS.journal, title: COPY.h.aFewLines, detail: `${JOURNAL_MIN}`, afterIndex: lastBefore },
    ...(phoneAway === null
      ? []
      : [{ key: "phone-away", icon: PLACED_ROW_ICONS.devicesOff, title: COPY.h.phoneAway, detail: display(phoneAway), afterIndex: lastBefore }]),
  ];

  return (
    <div className="flex flex-col gap-(--space-5)">
      {lightsOut === null || phoneAway === null ? null : (
        <Text as="p" tone="secondary" className="tabular-nums">
          {COPY.h.body(display(lightsOut), display(phoneAway))}
        </Text>
      )}

      <ListHeader list={list} nameLabel={COPY.h.listName} newLabel={COPY.h.newList} disabled={disabled} />

      <SlotRows
        list={list}
        candidates={candidates}
        placed={placed}
        disabled={disabled || list.templateId === null}
        listLabel={COPY.h.heading}
        leaveOutLabel={COPY.h.leaveOut}
        notOnThisDayLabel={COPY.h.notOnThisDay}
        includeLabel={COPY.h.include}
        usualOf={midpointOf}
        captionOf={(slot: SlotView) => (slot.pinnedClock === null ? null : COPY.h.confirmInTheMorning)}
        menuExtra={(slot: SlotView) =>
          phoneAwayInput === null
            ? []
            : slot.pinnedClock === null
              ? [{ label: COPY.h.afterPhoneAway, onClick: () => void list.setPinned(slot, phoneAwayInput) }]
              : [{ label: COPY.h.beforePhoneAway, onClick: () => void list.setPinned(slot, null) }]
        }
      />

      {lightsOut === null ? null : (
        <ListRow
          leading={PLACED_ROW_ICONS.lightsOut}
          title={COPY.h.lightsOut}
          trailing={
            <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
              {display(lightsOut)}
            </Text>
          }
          muted
        />
      )}

      <Button
        variant="ghost"
        disabled={disabled || list.templateId === null}
        onClick={() => setSheetOpen(true)}
        className="w-full wide:w-auto wide:self-start"
      >
        {COPY.h.addAHabit}
      </Button>

      {/* Sticky, tabular — where the wind-down starts (§4.13h). */}
      <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.h.sticky(list.name ?? COPY.h.defaultName(""), starts)}
        </Text>
      </div>

      <QuickHabitSheet
        open={sheetOpen}
        mode="wind-down-habit"
        onOpenChange={setSheetOpen}
        onSaved={(habit) => {
          void utils.habit.list.fetch({ includeArchived: false }).then((result) => {
            const fresh = result.habits.find((row) => row.id === habit.id);
            void list.addSlot({ habitId: habit.id, durationMin: fresh === undefined ? 10 : midpointOf(fresh), scheduling: "soft" });
          });
        }}
      />
    </div>
  );
}
