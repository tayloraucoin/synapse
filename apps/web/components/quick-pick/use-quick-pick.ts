"use client";

import * as React from "react";

import type { TrainingPlacement } from "@syn/types";
import type { ConfirmDayInput } from "@syn/validators";
import { clockToMinutes, formatClockFromMinutes, weekDates, weekKeyOf, weekdayForDayKey } from "@syn/utils";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { QUICK_PICK_COPY as COPY } from "./copy";

/**
 * The quick-pick's state — UX v1.1 §5.3 (DYN-14).
 *
 * EVERY SECTION STARTS ANSWERED. `day.quickPick` hands over today's defaults
 * — the pre-ticked menu, the last one-of choice, the typical workout and its
 * last placement, the week's focus — and this holds what the person changes.
 * *Set the day* sends only that (`confirmDayInput` is all-optional), plus the
 * menu's ticks and lengths (the service cannot know the ticked set) and the
 * training answer when the section exists.
 *
 * THE BUDGET LINE IS LIVE FROM THE PICK'S OWN ARITHMETIC. `chosenMin` is the
 * ticked lengths summed; `availableMin` is the section's, adjusted by the
 * one-of choices (a shorter breakfast gives the routine the difference —
 * §5.3: *68 chosen · 92 available*). Nothing changes colour, nothing refuses;
 * over budget is a question at *Set the day* (R7).
 *
 * NOTHING IS LIVE UNTIL CONFIRMED. The one call before *Set the day* is
 * `day.previewFit`, a read.
 */

export type QuickPickView = RouterOutputs["day"]["quickPick"];
export type QuickPickSection = "lastNight" | "working" | "routine" | "prep" | "training" | "work";

export function useQuickPick(initial: QuickPickView, options: { onSet: () => Promise<void> | void }) {
  const utils = trpc.useUtils();
  const query = trpc.day.quickPick.useQuery({ date: initial.date }, { initialData: initial });
  const view = query.data ?? initial;
  const confirm = trpc.day.confirm.useMutation();
  const [fitting, setFitting] = React.useState(false);

  /* -- the answers ------------------------------------------------------ */

  const [open, setOpen] = React.useState<Set<QuickPickSection>>(
    () => new Set<QuickPickSection>(initial.lastNight.length > 0 ? ["lastNight"] : []),
  );
  const [working, setWorking] = React.useState<boolean>(initial.shape?.default !== "unstructured");
  const [ticked, setTicked] = React.useState<Set<string>>(
    () => new Set((initial.routine?.menu?.items ?? []).filter((item) => item.ticked).map((item) => item.id)),
  );
  const [durations, setDurations] = React.useState<Map<string, number>>(() => new Map());
  const [variantId, setVariantId] = React.useState<string | null>(initial.routine?.assignedId ?? null);
  const [alternates, setAlternates] = React.useState<Map<string, string>>(
    () => new Map((initial.prep?.alternates ?? []).map((group) => [group.groupId, group.chosen])),
  );
  const [workoutId, setWorkoutId] = React.useState<string | null>(initial.training?.todays?.id ?? null);
  const [placement, setPlacement] = React.useState<TrainingPlacement | null>(initial.training?.lastPlacement ?? null);
  const [notToday, setNotToday] = React.useState(false);
  const [swapping, setSwapping] = React.useState(false);
  const [focusId, setFocusId] = React.useState<string | null>(initial.work?.assignedId ?? null);
  const [anchorIsHard, setAnchorIsHard] = React.useState<boolean>(initial.anchor?.isHard ?? true);
  const [lastNightTicked, setLastNightTicked] = React.useState<Set<string>>(() => new Set());
  const [overOpen, setOverOpen] = React.useState(false);
  const [adjusting, setAdjusting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleOpen = (section: QuickPickSection) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });

  /* -- the arithmetic --------------------------------------------------- */

  const menu = view.routine?.menu ?? null;
  const lengthOf = (id: string): number =>
    durations.get(id) ?? menu?.items.find((item) => item.id === id)?.durationMin ?? 0;
  const chosenMin = [...ticked].reduce((sum, id) => sum + lengthOf(id), 0);

  // A shorter one-of member gives the routine the difference.
  const prepDelta = (view.prep?.alternates ?? []).reduce((sum, group) => {
    const chosen = group.members.find((member) => member.slotId === alternates.get(group.groupId));
    const fallback = group.members.find((member) => member.isDefault) ?? group.members[0];
    if (!chosen || !fallback) return sum;
    return sum + (fallback.durationMin - chosen.durationMin);
  }, 0);
  const availableMin = Math.max(0, (menu?.availableMin ?? 0) + prepDelta);
  const overMin = Math.max(0, chosenMin - availableMin);

  const structured = view.shape === null ? view.routine !== null || view.work !== null : working;
  const workout = view.training?.todays && workoutId === view.training.todays.id
    ? view.training.todays
    : (view.training?.swaps.find((swap) => swap.id === workoutId) ?? null);
  const trade = view.training?.swaps.find((swap) => swap.id === workoutId) ?? null;
  const workoutUnplaced = structured && view.training !== null && workout !== null && !notToday && placement === null;

  /* -- shorten to fit ---------------------------------------------------- */

  async function shortenToFit(): Promise<void> {
    setError(null);
    setFitting(true);
    try {
      const result = await utils.day.previewFit.fetch({
        date: view.date,
        habitIds: [...ticked],
        durations: Object.fromEntries([...ticked].map((id) => [id, lengthOf(id)])),
        mode: "shorten_then_cut",
      });
      const next = new Map(durations);
      for (const keep of result.keep) next.set(keep.id, keep.durationMin);
      setDurations(next);
      setTicked((current) => {
        const after = new Set(current);
        for (const id of result.cut) after.delete(id);
        return after;
      });
      setAdjusting(false);
    } catch {
      setError(COPY.fitError);
    } finally {
      setFitting(false);
    }
  }

  /* -- set the day -------------------------------------------------------- */

  function payload(): ConfirmDayInput {
    const input: ConfirmDayInput = { date: view.date };
    if (view.shape !== null) input.workingToday = working;
    if (structured) {
      if (view.routine?.mode === "daily_menu" && menu) {
        input.routine = {
          menuHabitIds: [...ticked],
          menuDurations: Object.fromEntries([...ticked].filter((id) => durations.has(id)).map((id) => [id, lengthOf(id)])),
        };
      } else if (view.routine?.mode === "variants" && variantId !== null) {
        input.routine = { variantTemplateId: variantId };
      }
      if (view.prep) {
        input.alternates = view.prep.alternates.map((group) => ({
          groupId: group.groupId,
          chosenSlotId: alternates.get(group.groupId) ?? group.chosen,
        }));
      }
      if (view.training) {
        // R25: a swap trades with the other workout's next typical day.
        const tradeWithDate =
          !notToday && trade !== null && trade.tradesWithDay !== null
            ? weekDates(weekKeyOf(view.date)).find(
                (date) => weekdayForDayKey(date) === trade.tradesWithDay && date !== view.date,
              )
            : undefined;
        input.training = {
          workoutHabitId: notToday ? null : workoutId,
          placement: notToday ? null : placement,
          notToday,
          ...(tradeWithDate === undefined ? {} : { tradeWithDate }),
        };
      }
      if (view.work) {
        input.focusHabitId = focusId;
        if (view.work.askAnchor) input.anchorIsHard = anchorIsHard;
      }
    }
    if (view.lastNight.length > 0) input.lastNight = { doneItemIds: [...lastNightTicked] };
    return input;
  }

  async function set(force = false): Promise<void> {
    if (!force && structured && view.routine?.mode === "daily_menu" && overMin > 0) {
      setOverOpen(true);
      return;
    }
    setOverOpen(false);
    setError(null);
    try {
      await confirm.mutateAsync(payload());
      await utils.day.get.invalidate({ date: view.date });
      await utils.day.quickPick.invalidate({ date: view.date });
      await options.onSet();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function unstructured(): Promise<void> {
    setError(null);
    try {
      await confirm.mutateAsync({
        date: view.date,
        shape: "unstructured",
        ...(view.lastNight.length > 0 ? { lastNight: { doneItemIds: [...lastNightTicked] } } : {}),
      });
      await utils.day.get.invalidate({ date: view.date });
      await utils.day.quickPick.invalidate({ date: view.date });
      await options.onSet();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  /** "9:11" — where the routine runs to on this plan (the dialog's sentence). */
  const runsTo =
    view.anchor === null
      ? null
      : formatClockFromMinutes(clockToMinutes(toInputClock(view.anchor.clock)) + overMin);

  return {
    view,
    open,
    toggleOpen,
    structured,
    working,
    setWorking,
    ticked,
    setTicked,
    lengthOf,
    chosenMin,
    availableMin,
    overMin,
    variantId,
    setVariantId,
    alternates,
    setAlternates,
    workoutId,
    setWorkoutId,
    workout,
    trade,
    placement,
    setPlacement,
    notToday,
    setNotToday,
    swapping,
    setSwapping,
    workoutUnplaced,
    focusId,
    setFocusId,
    anchorIsHard,
    setAnchorIsHard,
    lastNightTicked,
    setLastNightTicked,
    shortenToFit,
    fitting,
    adjusting,
    setAdjusting,
    overOpen,
    setOverOpen,
    runsTo,
    set,
    unstructured,
    setting: confirm.isPending,
    error,
  };
}

export type QuickPickApi = ReturnType<typeof useQuickPick>;

/** "9:00" / "9:00 AM" → "09:00" for `clockToMinutes`. */
function toInputClock(clock: string): string {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(clock);
  if (!match) return "00:00";
  let hour = Number(match[1]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}
