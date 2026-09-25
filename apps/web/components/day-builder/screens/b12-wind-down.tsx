"use client";

import * as React from "react";

import { PLACED_ROW_ICONS, STARTER_LIBRARY } from "@syn/constants";
import type { HabitSummaryView, SlotView } from "@syn/types";
import { Button, GroupHeading, ListRow, SelectRow, SelectRowList, StatusLine, Text } from "@syn/ui";

import { JournalSettings } from "@/components/journal-settings";
import { usePrepSteps } from "../use-prep-steps";
import { QuickHabitSheet } from "@/components/habit-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
import { display, minutesOf, toInputClock } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { ListHeader } from "../list-header";
import { SlotRows, type PlacedRow } from "../slot-rows";
import { totalOf, type BuilderScreen, type DayBuilderApi } from "../use-day-builder";
import { useListScreen } from "../use-list-screen";
import { useMorningRoom } from "./b11-morning";

/** The journal's length on the walk (v1.2 §4.11: *around 10 minutes*). */
export const JOURNAL_MIN = 10;

const STARTER_TITLES = new Set(
  STARTER_LIBRARY.wind_down.filter((entry) => entry.placed !== true).map((entry) => entry.title.toLowerCase()),
);

function midpointOf(habit: HabitSummaryView): number {
  const min = habit.durationMin ?? 10;
  const max = habit.durationMax ?? min;
  return Math.round((min + max) / 2 / 5) * 5 || min;
}

/**
 * B12 — winding down (UX v1.3 §4.4 B12, R64; v1.2 §4.13h and §4.11 merged;
 * 13h renamed by DAY-10).
 *
 * THE TIMES ARE B2's: the body reads *Lights out 22:45 · phone away 21:45.*
 * and *Change* goes back there — nothing here writes a time. THE LIST IS THE
 * WIND-DOWN TEMPLATE's SLOTS; a new list starts empty, with the eight
 * starters above it while it is new — a tick creates the habit
 * (`block_kind: wind_down`) and its slot at the midpoint through the same
 * per-row queue as B5, and the row moves into *In order*. The two placed
 * rows and lights out are the plan's times, never slots — DYN-18 places
 * them at materialisation — so they render in position, muted, without a
 * handle; a habit moved below *Phone away* is pinned there and reads
 * *confirm in the morning*.
 *
 * ON THE FIRST PLAN ONLY, the journal group — `JournalSettings`, the same
 * component Settings mounts. ON A LATER PLAN WITH ONE ROUTINE FOR EVERY DAY
 * (§13 #42), B11 is not in the walk: this screen opens on the shared
 * routine's line and *Change for this day*, and a plan with no routine yet
 * takes the first plan's — ONE TEMPLATE, REFERENCED, never copied.
 */
export function ScreenWindDown({
  api,
  disabled,
  onGo,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onGo: (screen: BuilderScreen) => void;
}) {
  const utils = trpc.useUtils();
  const online = useOnline();
  const plan = api.plan;
  const plans = trpc.dayPlan.list.useQuery(undefined);
  const candidates = React.useMemo(() => api.habitsOf((habit) => habit.blockKind === "wind_down"), [api]);
  const seed = React.useCallback(() => [], []);
  const list = useListScreen({ api, kind: "wind_down", fk: "windDownTemplateId", defaultName: COPY.b12.defaultName, seed });
  const steps = usePrepSteps({ templateId: list.templateId, kind: "wind_down" });
  const { room } = useMorningRoom(api);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const first = plan?.sortOrder === 0;
  const shared = !first && api.profile?.sameMorningRoutine === true;

  // A later plan on the shared routine with none of its own takes the first plan's — referenced, never copied.
  const firstMorning = plans.data?.[0]?.morning ?? null;
  const adopting = React.useRef(false);
  React.useEffect(() => {
    if (!shared || plan === null || plan.morning !== null || firstMorning === null || adopting.current || disabled) return;
    adopting.current = true;
    void api.patch({ morningTemplateId: firstMorning.templateId });
  }, [shared, plan, firstMorning, api, disabled]);

  // Whether the list was new when this screen first saw it — decided once, so a tick never hides the rest.
  const [startedEmpty, setStartedEmpty] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    if (startedEmpty !== null || list.templateId === null || list.slots === null) return;
    setStartedEmpty(list.slots.length === 0);
  }, [startedEmpty, list.templateId, list.slots]);

  if (plan === null) return null;

  const lightsOut = minutesOf(api.times.lightsOut);
  const phoneAway = minutesOf(api.times.devicesOff);
  const phoneAwayInput = toInputClock(api.times.devicesOff);

  const slots = (list.slots ?? []).filter((slot) => slot.role !== "pool");
  const before = slots.filter((slot) => slot.pinnedClock === null);
  const total = totalOf(before);
  const starts = phoneAway === null ? null : display(phoneAway - JOURNAL_MIN - total);
  const lastBefore = slots.reduce((last, slot, index) => (slot.pinnedClock === null ? index : last), -1);
  const placed: PlacedRow[] = [
    { key: "journal", icon: PLACED_ROW_ICONS.journal, title: COPY.b12.aFewLines, detail: `${JOURNAL_MIN}`, afterIndex: lastBefore },
    ...(phoneAway === null
      ? []
      : [{ key: "phone-away", icon: PLACED_ROW_ICONS.devicesOff, title: COPY.b12.phoneAway, detail: display(phoneAway), afterIndex: lastBefore }]),
  ];
  // The starters not yet in this list — a ticked one leaves at once (its tick is ahead of the write).
  const starters = steps.rows.filter((row) => STARTER_TITLES.has(row.title.toLowerCase()) && !row.selected);
  const showStarters = startedEmpty === true && starters.length > 0;
  const morning = plan.morning;

  return (
    <div className="flex flex-col gap-(--space-5)">
      {shared && morning !== null ? (
        <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
          <Text as="p" variant="secondary" tone="secondary" className="tabular-nums">
            {COPY.b12.sharedRoutine(morning.name, morning.totalMin, room)}
          </Text>
          <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onGo("b11")}>
            {COPY.b12.changeForThisDay}
          </Button>
        </div>
      ) : null}

      {lightsOut === null || phoneAway === null ? null : (
        <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
          <Text as="p" tone="secondary" className="tabular-nums">
            {COPY.b12.body(display(lightsOut), display(phoneAway))}
          </Text>
          <Button variant="ghost" size="sm" aria-label={COPY.b12.changeTheTimes} onClick={() => onGo("b02")}>
            {COPY.b12.change}
          </Button>
        </div>
      )}

      <ListHeader list={list} nameLabel={COPY.b12.listName} newLabel={COPY.b12.newList} disabled={disabled} />

      {list.templateId === null || list.slots === null || startedEmpty === null ? (
        list.missing ? null : <BuilderSkeleton />
      ) : (
        <>
          {showStarters ? (
            <SelectRowList columns={2}>
              {starters.map((row) => (
                <SelectRow
                  key={row.key}
                  icon={row.icon}
                  title={row.title}
                  detail={COPY.b12.range(row.rangeMin, row.rangeMax)}
                  selected={false}
                  committing={row.committing}
                  disabled={disabled || row.locked}
                  onToggle={(next) => steps.toggle(row, next)}
                />
              ))}
            </SelectRowList>
          ) : null}
          {steps.line === null ? null : <StatusLine variant="sync-issues" text={steps.line} placement="inline" />}

          <section className="flex flex-col gap-(--space-3)">
            <GroupHeading>{COPY.b12.inOrder}</GroupHeading>
            <SlotRows
              list={list}
              candidates={candidates}
              placed={placed}
              disabled={disabled}
              listLabel={COPY.b12.heading}
              leaveOutLabel={COPY.b12.leaveOut}
              notOnThisDayLabel={COPY.b12.notOnThisDay}
              includeLabel={COPY.b12.include}
              usualOf={midpointOf}
              captionOf={(slot: SlotView) => (slot.pinnedClock === null ? null : COPY.b12.confirmInTheMorning)}
              menuExtra={(slot: SlotView) =>
                phoneAwayInput === null
                  ? []
                  : slot.pinnedClock === null
                    ? [{ label: COPY.b12.afterPhoneAway, onClick: () => void list.setPinned(slot, phoneAwayInput) }]
                    : [{ label: COPY.b12.beforePhoneAway, onClick: () => void list.setPinned(slot, null) }]
              }
            />
          </section>

          {lightsOut === null ? null : (
            <ListRow
              leading={PLACED_ROW_ICONS.lightsOut}
              title={COPY.b12.lightsOut}
              trailing={
                <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
                  {display(lightsOut)}
                </Text>
              }
              muted
            />
          )}

          <Button variant="ghost" disabled={disabled} onClick={() => setSheetOpen(true)} className="w-full wide:w-auto wide:self-start">
            {COPY.b12.addAHabit}
          </Button>
        </>
      )}

      {/* The first plan only — the journal, which every later plan follows (v1.3 §4.4 B12). */}
      {first && api.profile !== null && phoneAwayInput !== null ? (
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.b12.aFewLinesGroup}</GroupHeading>
          <JournalSettings
            initialJournalEnabled={api.profile.journalEnabled}
            initialPrompts={api.profile.journalPrompts}
            initialReminderTime={api.profile.journalReminderTime}
            initialReminderEnabled={api.profile.journalReminderEnabled}
            phoneAway={phoneAwayInput}
            disabled={disabled || !online}
          />
        </section>
      ) : null}

      {/* Sticky, tabular — where the wind-down starts (§4.4 B12). */}
      <div className="bg-paper border-hairline sticky bottom-[calc(var(--target)+2*var(--space-3)+env(safe-area-inset-bottom))] border-t pt-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.b12.sticky(list.name ?? COPY.b12.defaultName(""), starts)}
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
