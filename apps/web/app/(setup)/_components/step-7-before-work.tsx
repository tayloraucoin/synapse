"use client";

import * as React from "react";

import {
  Button,
  CheckboxField,
  EllipsesMenu,
  ListRow,
  MinutesStepper,
  PickerList,
  SkeletonRow,
  Text,
  type PickerListGroup,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import type { SlotView } from "@syn/types";
import { clockFromMinutes, clockToMinutes, computeBudget, formatClockFromMinutes } from "@syn/utils";

import { midpoint, parseClock, walkSlots } from "@/components/block-editor";
import { HabitSheet } from "@/components/habit-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 7 — Before work (UX v1.1 §4.7).
 *
 * "The prep list with a length each, so the morning's budget can be
 * computed." Items here only have lengths — the stack is computed backward
 * from work (§3.3) — so nothing on this screen asks for a time. Each tick or
 * stepper change writes a slot on the prep template at once (`priority` 7,
 * `hard`: prep is mandatory, §4.7); *Continue* has nothing left to save.
 *
 * The footer is `computeBudget` over the profile's wake and work start, the
 * orient template's total and this list's walk — the same arithmetic the
 * fit screen and the block editor show (§3.10).
 */

const ORIENT_FALLBACK_MIN = 0;

export function Step7BeforeWork({
  initialWake,
  initialWorkStart,
  embedded = false,
  onSaved,
}: {
  initialWake: string;
  initialWorkStart: string | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();

  const prepList = trpc.template.list.useQuery({ includeArchived: false, kind: "prep" });
  const orientList = trpc.template.list.useQuery({ includeArchived: false, kind: "orient" });
  const create = trpc.template.create.useMutation();
  const templateId = prepList.data?.[0]?.id ?? null;

  // The prep template exists from the first visit: the list is its slots.
  const creating = React.useRef(false);
  React.useEffect(() => {
    if (!prepList.isSuccess || templateId !== null || creating.current) return;
    creating.current = true;
    void create.mutateAsync({ kind: "prep" }).then(() => utils.template.list.invalidate());
  }, [prepList.isSuccess, templateId, create, utils]);

  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null });
  const prepHabits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "prep" });
  const saveSlot = trpc.template.saveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();

  const [oneOfOpen, setOneOfOpen] = React.useState<{ slotId: string; habitId: string | null; minutes: number } | null>(null);
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);

  const slots = React.useMemo(() => detail.data?.slots ?? [], [detail.data?.slots]);
  const habits = React.useMemo(() => prepHabits.data?.habits ?? [], [prepHabits.data?.habits]);
  const busy = saveSlot.isPending || removeSlot.isPending || fromLibrary.isPending;
  const disabled = !online || busy || templateId === null;

  async function refresh(): Promise<void> {
    if (templateId !== null) await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
    await utils.habit.list.invalidate();
  }

  async function addSlot(habitId: string, durationMin: number, partnerId?: string): Promise<void> {
    if (templateId === null) return;
    await saveSlot.mutateAsync({
      templateId,
      habitId,
      durationMin,
      gapBeforeMin: 0,
      pinnedClock: null,
      role: "stack",
      priorityOverride: 7,
      scheduling: "hard",
      ...(partnerId === undefined ? {} : { alternatesWith: partnerId, alternatesDefault: false }),
    });
    await refresh();
  }

  /** A tick: the starter row, then a slot at the offer's length. */
  async function tick(title: string, minutes: number, on: boolean): Promise<void> {
    if (templateId === null) return;
    const slot = slots.find((row) => row.title === title);
    if (!on) {
      if (slot) {
        await removeSlot.mutateAsync({ id: slot.id });
        await refresh();
      }
      return;
    }
    let habit = habits.find((row) => row.title === title) ?? null;
    if (habit === null) {
      await fromLibrary.mutateAsync({ blockKind: "prep", titles: [title] });
      const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: "prep" });
      habit = fresh.habits.find((row) => row.title === title) ?? null;
    }
    if (habit === null) return;
    await addSlot(habit.id, minutes);
  }

  async function setLength(slot: SlotView, durationMin: number): Promise<void> {
    if (templateId === null) return;
    await saveSlot.mutateAsync({
      templateId,
      slotId: slot.id,
      habitId: slot.habitId,
      durationMin,
      gapBeforeMin: slot.gapBeforeMin,
      pinnedClock: toInputClock(slot.pinnedClock),
      role: slot.role,
      priorityOverride: slot.overridden ? slot.priority : null,
      scheduling: slot.scheduling,
    });
    await refresh();
  }

  async function remove(slot: SlotView): Promise<void> {
    await removeSlot.mutateAsync({ id: slot.id });
    await refresh();
  }

  // The footer: this list's walk against the profile and the orient total.
  const walk = React.useMemo(
    () => walkSlots(slots, "prep", "backward", null, null),
    [slots],
  );
  const totalMin = walk.totalMin;
  const orientMin = orientList.data?.[0]?.totalMin ?? ORIENT_FALLBACK_MIN;
  const wakeMin = clockToMinutes(initialWake.slice(0, 5));
  const workMin = initialWorkStart === null ? null : clockToMinutes(initialWorkStart.slice(0, 5));
  const left =
    workMin === null
      ? null
      : computeBudget({ wakeMin, workStartMin: workMin, orientMin, prepTotalMin: totalMin }).availableMin;

  const ticked = new Set(slots.map((slot) => slot.title));
  const groupsFor = (excludeHabitId: string | null): PickerListGroup[] => {
    const items = habits
      .filter((habit) => habit.id !== excludeHabitId)
      .map((habit) => ({ id: habit.id, icon: habit.icon, title: habit.title }));
    return items.length === 0 ? [] : [{ heading: COPY.addSomethingElse, items }];
  };
  const onWalk = slots.filter((slot) => slot.alternates === null || slot.alternates.isDefault);

  return (
    <FactScreen
      step={7}
      heading={COPY.step7Heading}
      body={COPY.step7Body}
      save={null}
      embedded={embedded}
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-5)">
        {/* The chooser band: six offers, nothing checked (§4.7). */}
        <div role="group" aria-label={COPY.step7Heading} className="flex flex-wrap gap-x-(--space-4) gap-y-(--space-2)">
          {COPY.prepOffers.map((offer) => (
            <CheckboxField
              key={offer.title}
              checked={ticked.has(offer.title)}
              disabled={disabled}
              onCheckedChange={(next) => {
                void tick(offer.title, offer.minutes, next === true);
              }}
            >
              {offer.title}
            </CheckboxField>
          ))}
        </div>

        {detail.isLoading || (prepList.isSuccess && templateId === null) ? (
          <div className="flex flex-col gap-(--space-2)">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : onWalk.length === 0 ? (
          <Text as="p" tone="secondary">
            {COPY.nothingYetPrep}
          </Text>
        ) : (
          <ul className="flex flex-col">
            {onWalk.map((slot) => {
              const other =
                slot.alternates === null
                  ? null
                  : (slots.find((row) => row.id !== slot.id && row.alternates?.group === slot.alternates?.group) ?? null);
              return (
                <React.Fragment key={slot.id}>
                  <ListRow
                    as="li"
                    title={slot.title}
                    meta={
                      other === null
                        ? undefined
                        : `${COPY.oneOf} · ${COPY.or} ${other.title} · ${other.durationMin} min`
                    }
                    trailing={
                      <span className="flex items-center gap-(--space-2)">
                        <MinutesStepper
                          label={`${COPY.takes}: ${slot.title}`}
                          value={slot.durationMin}
                          onChange={(next) => void setLength(slot, next)}
                          min={DURATION_MIN}
                          max={DURATION_MAX}
                          step={5}
                          disabled={disabled}
                        />
                        <EllipsesMenu
                          label={slot.title}
                          disabled={disabled}
                          items={[
                            other === null
                              ? {
                                  label: COPY.makeOneOf,
                                  onClick: () => setOneOfOpen({ slotId: slot.id, habitId: null, minutes: 15 }),
                                }
                              : { label: COPY.justThisOne, onClick: () => void remove(other) },
                            { label: COPY.remove, onClick: () => void remove(slot) },
                          ]}
                        />
                      </span>
                    }
                  />
                  {oneOfOpen?.slotId === slot.id ? (
                    <li className="bg-surface/60 flex flex-col gap-(--space-3) rounded-(--radius) p-(--space-3)">
                      <Text as="span" variant="caption" tone="secondary">
                        {COPY.or}
                      </Text>
                      <PickerList
                        groups={groupsFor(slot.habitId)}
                        value={oneOfOpen.habitId}
                        onSelect={(id) => {
                          const chosen = habits.find((row) => row.id === id);
                          setOneOfOpen({ slotId: slot.id, habitId: id, minutes: chosen ? midpoint(chosen) : 15 });
                        }}
                        createLabel={COPY.addSomethingElse}
                        onCreate={() => setHabitSheetOpen(true)}
                        searchLabel={COPY.searchHabits}
                        emptyText={COPY.nothingYetPrep}
                        presentation="inline"
                      />
                      <MinutesStepper
                        label={COPY.takes}
                        value={oneOfOpen.minutes}
                        onChange={(next) => setOneOfOpen({ ...oneOfOpen, minutes: next })}
                        min={DURATION_MIN}
                        max={DURATION_MAX}
                        step={5}
                        disabled={disabled || oneOfOpen.habitId === null}
                      />
                      <div className="flex justify-end gap-(--space-2)">
                        <Button variant="ghost" size="sm" onClick={() => setOneOfOpen(null)}>
                          {COPY.justThisOne}
                        </Button>
                        <Button
                          size="sm"
                          disabled={disabled || oneOfOpen.habitId === null}
                          busy={saveSlot.isPending}
                          onClick={() => {
                            if (oneOfOpen.habitId === null) return;
                            void addSlot(oneOfOpen.habitId, oneOfOpen.minutes, slot.id).then(() => setOneOfOpen(null));
                          }}
                        >
                          {COPY.add}
                        </Button>
                      </div>
                    </li>
                  ) : null}
                </React.Fragment>
              );
            })}
          </ul>
        )}

        <Button
          variant="ghost"
          className="self-start"
          disabled={disabled}
          onClick={() => setHabitSheetOpen(true)}
        >
          {COPY.addSomethingElse}
        </Button>

        {/* Sticky, tabular — the budget the morning will have (§4.7). */}
        <div className="bg-paper sticky bottom-0 border-t border-hairline pt-(--space-3)">
          <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
            {left === null || workMin === null
              ? COPY.prepFooterNoWork(totalMin)
              : COPY.prepFooter(totalMin, formatClockFromMinutes(workMin), formatClockFromMinutes(wakeMin), left)}
          </Text>
        </div>
      </div>

      <HabitSheet
        open={habitSheetOpen}
        mode="create"
        defaults={{ blockKind: "prep" }}
        onOpenChange={setHabitSheetOpen}
        onSaved={(created) => {
          void utils.habit.list.invalidate().then(async () => {
            const fresh = await utils.habit.get.fetch({ id: created.id });
            const minutes = midpoint({ durationMin: fresh.durationMinMin, durationMax: fresh.durationMaxMin });
            if (oneOfOpen !== null) {
              setOneOfOpen({ ...oneOfOpen, habitId: created.id, minutes });
              return;
            }
            await addSlot(created.id, minutes);
          });
        }}
      />
    </FactScreen>
  );
}

/** "07:20" for the validator from the view's "7:20" / "7:20 AM". */
function toInputClock(clock: string | null): string | null {
  const minutes = parseClock(clock);
  return minutes === null ? null : clockFromMinutes(minutes);
}
