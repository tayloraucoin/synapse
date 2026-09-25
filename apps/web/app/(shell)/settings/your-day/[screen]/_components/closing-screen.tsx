"use client";

import * as React from "react";

import { Button, GroupHeading, ListRow, SelectRow, SelectRowList, StatusLine, Text } from "@syn/ui";
import { DEVICES_OFF_OFFSET_MIN, PLACED_ROW_ICONS, STARTER_LIBRARY } from "@syn/constants";
import type { IconValue, JournalPrompt } from "@syn/types";
import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";
import { HabitSheet } from "@/components/habit-sheet";
import { JournalSettings } from "@/components/journal-settings";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

/**
 * Settings → Your day → *Closing the day* (UX v1.3 §4.6) — v1.2's screen 11
 * (§4.11, R38; RUN-11, on DYN-11/18), moved here by DAY-13 when the step
 * files were retired.
 *
 * UX v1.3 R64 (DAY-10): THE TIMES ARE EACH DAY PLAN'S. Lights out and phone
 * away are set per day in the builder (B2); here they read as the profile's
 * values, muted, with one line that says where they are changed. The journal
 * — the switch, the prompts, the reminder — is `JournalSettings`, the same
 * component the builder's B12 mounts on the first plan.
 *
 * THE WIND-DOWN STARTERS TICK LIKE THE MORNING'S — a tick creates the habit
 * (`block_kind wind_down`) and nothing else: lengths and order are the day
 * builder's (§4.4 B12), and the wind-down template still places the journal
 * and *Phone away* itself at materialisation (§7.1). Nothing pre-selected.
 */

const WIND_DOWN_OFFERS = STARTER_LIBRARY.wind_down.filter((entry) => entry.placed !== true);

/** "HH:mm" minus `offsetMin`, wrapping past midnight. */
function minus(clock: string, offsetMin: number): string {
  return clockFromMinutes(clockToMinutes(clock) - offsetMin);
}

export function ClosingScreen({
  initialLightsOut,
  initialDevicesOff,
  initialJournalEnabled,
  initialPrompts,
  initialReminderTime,
  initialReminderEnabled,
  onSaved,
}: {
  initialLightsOut: string | null;
  /** The stored value; null = following lights out. */
  initialDevicesOff: string | null;
  initialJournalEnabled: boolean;
  initialPrompts: JournalPrompt[];
  /** The stored value; null = following phone away. */
  initialReminderTime: string | null;
  initialReminderEnabled: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const windDownHabits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "wind_down" });
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();
  const archive = trpc.habit.archive.useMutation();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [pending, setPending] = React.useState<Map<string, boolean>>(new Map());
  const [line, setLine] = React.useState<string | null>(null);
  const inFlight = React.useRef<Map<string, Promise<void>>>(new Map());

  const lightsOut = initialLightsOut === null ? "22:45" : initialLightsOut.slice(0, 5);
  const devicesOffEffective = initialDevicesOff?.slice(0, 5) ?? minus(lightsOut, DEVICES_OFF_OFFSET_MIN);
  const display = (clock: string) => formatClockFromMinutes(clockToMinutes(clock));

  /* ---------------------------------------------- the wind-down rows -- */

  const habits = React.useMemo(() => windDownHabits.data?.habits ?? [], [windDownHabits.data?.habits]);
  const byTitle = new Map(habits.map((habit) => [habit.title.toLowerCase(), habit]));

  const toggle = (title: string, on: boolean) => {
    setLine(null);
    setPending((current) => new Map(current).set(title, on));
    const previous = inFlight.current.get(title) ?? Promise.resolve();
    const run = previous
      .catch(() => undefined)
      .then(async () => {
        const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: "wind_down" });
        const habit = fresh.habits.find((row) => row.title.toLowerCase() === title.toLowerCase());
        if (on) {
          if (!habit) await fromLibrary.mutateAsync({ blockKind: "wind_down", titles: [title] });
        } else if (habit) {
          const usage = await utils.habit.usage.fetch({ id: habit.id });
          if (usage.recentDays.length === 0) await archive.mutateAsync({ id: habit.id });
        }
        await utils.habit.list.invalidate();
      })
      .catch(() => setLine(COPY.stepSaveError(title)))
      .finally(() => {
        if (inFlight.current.get(title) === run) {
          inFlight.current.delete(title);
          setPending((current) => {
            const next = new Map(current);
            next.delete(title);
            return next;
          });
        }
      });
    inFlight.current.set(title, run);
  };

  return (
    <FactScreen
      step={11}
      heading={COPY.step11Heading}
      body={COPY.step11Body}
      embedded
      onSaved={onSaved}
      save={null}
    >
      <div className="flex flex-col gap-(--space-6)">
        {/* v1.3 R64: the profile's two times, read-only — each day plan sets its own. */}
        <section className="flex flex-col gap-(--space-1)">
          <ListRow
            leading={PLACED_ROW_ICONS.lightsOut as IconValue}
            title={COPY.lightsOut}
            trailing={
              <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
                {display(lightsOut)}
              </Text>
            }
          />
          <ListRow
            leading={PLACED_ROW_ICONS.devicesOff as IconValue}
            title={COPY.phoneAway}
            trailing={
              <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
                {display(devicesOffEffective)}
              </Text>
            }
          />
          <Text as="p" variant="caption" tone="secondary">
            {COPY.timesAreEachDays}
          </Text>
        </section>

        {/* The wind-down starters as rows — a tick creates the habit; nothing pre-selected (§4.11). */}
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.windDownBand}</GroupHeading>
          <SelectRowList columns={2}>
            {WIND_DOWN_OFFERS.map((offer) => {
              const habit = byTitle.get(offer.title.toLowerCase());
              const ahead = pending.get(offer.title);
              return (
                <SelectRow
                  key={offer.title}
                  icon={offer.icon as IconValue}
                  title={offer.title}
                  detail={COPY.rangeLabel(offer.rangeMin, offer.rangeMax)}
                  selected={ahead ?? habit !== undefined}
                  committing={pending.has(offer.title)}
                  disabled={!online}
                  onToggle={(next) => toggle(offer.title, next)}
                />
              );
            })}
          </SelectRowList>
          <Button
            variant="secondary"
            className="w-full wide:w-auto wide:self-start"
            disabled={!online}
            onClick={() => setSheetOpen(true)}
          >
            {COPY.addSomethingElse}
          </Button>
        </section>

        {/* The journal: the switch, the prompts, the reminder (§4.11, R38) — shared with B12. */}
        <JournalSettings
          initialJournalEnabled={initialJournalEnabled}
          initialPrompts={initialPrompts}
          initialReminderTime={initialReminderTime}
          initialReminderEnabled={initialReminderEnabled}
          phoneAway={devicesOffEffective}
          disabled={!online}
        />

        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}
      </div>

      <HabitSheet
        open={sheetOpen}
        mode="wind-down-habit"
        onOpenChange={setSheetOpen}
        onSaved={() => void utils.habit.list.invalidate()}
      />
    </FactScreen>
  );
}
