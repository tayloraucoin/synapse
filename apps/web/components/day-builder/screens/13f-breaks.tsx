"use client";

import * as React from "react";

import { STARTER_LIBRARY } from "@syn/constants";
import type { DayPlanBreak, HabitSummaryView } from "@syn/types";
import { Button, QuickChipRow, SelectRow, SelectRowList, Text, TimeField } from "@syn/ui";

import { QuickHabitSheet } from "@/components/habit-sheet";
import { trpc } from "@/lib/trpc/client";

import { DAY_BUILDER_COPY as COPY } from "../copy";
import type { DayBuilderApi } from "../use-day-builder";

/**
 * 13f — during the day (UX v1.2 §4.13f).
 *
 * THE STARTERS ARE ROWS; a tick makes the habit if the library does not
 * have it yet (`createFromStarterLibrary`, the break block's list) and
 * writes `breaks` with *midday*. *At a time* opens a clock and writes it.
 * *Skip for now* writes an empty list, so the plan says it was asked.
 */
export function ScreenBreaks({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const utils = trpc.useUtils();
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();
  const plan = api.plan;
  const [adding, setAdding] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [line, setLine] = React.useState<string | null>(null);

  const breakHabits = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "break"), [api]);
  const starters = STARTER_LIBRARY.break;
  const rows: Array<{ key: string; title: string; habit: HabitSummaryView | null; icon: HabitSummaryView["icon"] | null }> =
    React.useMemo(() => {
      const byTitle = new Map(breakHabits.map((habit) => [habit.title.toLowerCase(), habit]));
      const fromStarters = starters.map((entry) => {
        const habit = byTitle.get(entry.title.toLowerCase()) ?? null;
        return { key: entry.title, title: entry.title, habit, icon: habit?.icon ?? entry.icon };
      });
      const own = breakHabits
        .filter((habit) => !starters.some((entry) => entry.title.toLowerCase() === habit.title.toLowerCase()))
        .map((habit) => ({ key: habit.id, title: habit.title, habit, icon: habit.icon }));
      return [...fromStarters, ...own];
    }, [breakHabits, starters]);

  if (plan === null) return null;
  const breaks = plan.breaks;
  const write = (next: readonly DayPlanBreak[]) => api.patch({ breaks: next.map((entry) => ({ habitId: entry.habitId, at: entry.at })) });
  const showRows = adding || breaks.length > 0;

  const ensureHabit = async (row: (typeof rows)[number]): Promise<string> => {
    if (row.habit !== null) return row.habit.id;
    const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: "break" });
    const existing = fresh.habits.find((habit) => habit.title.toLowerCase() === row.title.toLowerCase());
    if (existing !== undefined) return existing.id;
    const made = await fromLibrary.mutateAsync({ blockKind: "break", titles: [row.title] });
    const first = made.rows[0];
    if (first === undefined) throw new Error("no_habit");
    await utils.habit.list.invalidate();
    return first.id;
  };

  return (
    <div className="flex flex-col gap-(--space-5)">
      {!showRows ? (
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" variant="secondary" tone="secondary">
            {COPY.f.nothingYet}
          </Text>
          <Button variant="secondary" disabled={disabled} onClick={() => setAdding(true)} className="w-full wide:w-auto wide:self-start">
            {COPY.f.addABreak}
          </Button>
        </div>
      ) : (
        <SelectRowList>
          {rows.map((row) => {
            const entry = row.habit === null ? null : (breaks.find((item) => item.habitId === row.habit?.id) ?? null);
            return (
              <div key={row.key} className="flex flex-col gap-(--space-3)">
                <SelectRow
                  icon={row.icon}
                  title={row.title}
                  detail={row.habit?.durationMin === null || row.habit === null ? undefined : COPY.c.minutes(row.habit.durationMin)}
                  selected={entry !== null}
                  disabled={disabled}
                  error={line}
                  onCommitError={() => setLine(COPY.saveError)}
                  onToggle={async (selected) => {
                    setLine(null);
                    if (selected) {
                      const habitId = await ensureHabit(row);
                      await write([...breaks, { habitId, at: "midday" }]);
                    } else if (row.habit !== null) {
                      const id = row.habit.id;
                      await write(breaks.filter((item) => item.habitId !== id));
                    }
                  }}
                />
                {entry === null ? null : (
                  <div className="flex flex-col gap-(--space-3) ps-(--space-4)">
                    <QuickChipRow
                      label={COPY.f.when}
                      selected={entry.at === "midday" ? "midday" : "at"}
                      disabled={disabled}
                      onSelect={(value) =>
                        void write(
                          breaks.map((item) =>
                            item.habitId === entry.habitId
                              ? { ...item, at: value === "midday" ? "midday" : (api.times.workStart ?? "12:00") }
                              : item,
                          ),
                        )
                      }
                      chips={[
                        { label: COPY.f.midday, value: "midday" },
                        { label: COPY.f.atATime, value: "at" },
                      ]}
                    />
                    {entry.at === "midday" ? null : (
                      <TimeField
                        label={COPY.f.at}
                        value={entry.at}
                        disclosed
                        doneLabel={COPY.done}
                        disabled={disabled}
                        onChange={(value) =>
                          void write(breaks.map((item) => (item.habitId === entry.habitId ? { ...item, at: value } : item)))
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </SelectRowList>
      )}

      {showRows ? (
        <Button variant="ghost" disabled={disabled} onClick={() => setSheetOpen(true)} className="w-full wide:w-auto wide:self-start">
          {COPY.f.somethingElse}
        </Button>
      ) : null}

      <QuickHabitSheet
        open={sheetOpen}
        mode="break"
        onOpenChange={setSheetOpen}
        onSaved={(habit) => void write([...breaks, { habitId: habit.id, at: "midday" }])}
      />
    </div>
  );
}
