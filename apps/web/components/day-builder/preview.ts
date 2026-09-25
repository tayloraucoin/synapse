import type { BlockKind, DayPlanView, FixtureView, HabitSummaryView, IconValue, SlotView } from "@syn/types";
import { stackBlock } from "@syn/utils";

import { toStackItems } from "@/components/block-editor";

import { minutesOf } from "./clock";
import { DAY_BUILDER_COPY as COPY } from "./copy";
import type { BuilderScreen, EffectiveTimes } from "./use-day-builder";

/**
 * The builder's preview — UX v1.2 §4.13i (RUN-12), v1.3 R67 (DAY-9): the day
 * as it stands, laid out on the client through `stackBlock`, the one
 * arithmetic (v1.1 §3.3, DYN-1). B17 draws it whole; B7 draws it cut at the
 * end of work (`cutAtWorkEnd`).
 *
 * UNDER V1.3 IT MIRRORS DAY-6'S MATERIALISER: one training band per entry of
 * the plan's training, in the list's order (TD-24), and a fixture's planned
 * travel as thin ends beside it (TD-27).
 *
 * NOTHING HERE IS WRITTEN. `day_blocks` and `day_items` are RUN-5's
 * `prefillWeek`'s to create, called by RUN-13's completion; this is the same
 * walk over the plan's parts so the review shows what that will draw. Where
 * the two disagree, the service is right and this is the defect.
 *
 * THE WALK, IN ORDER (v1.1 §3.3, §3.7, §7.1): orient at wake; the routine
 * forward from the end of orient; getting ready backward to *working by*;
 * training before or after the routine, inside work, or after it; work
 * from *working by* to *until about*, with breaks inside; fixtures at their
 * clocks; the wind-down backward to phone away, then lights out. On a
 * *No work* day the routine runs from orient and getting ready follows it.
 */

export type PreviewItem = {
  id: string;
  title: string;
  icon: IconValue | null;
  startMin: number;
  endMin: number;
  /** The slot behind a list's item — tap opens the slot sheet. */
  slot?: { templateId: string; slot: SlotView };
  /** A fixture or a placed row — the anchor glyph. */
  pinned?: boolean;
  /** A workout's travel: a thin end on its band. */
  travel?: "there" | "back";
};

export type PreviewBlock = {
  key: string;
  kind: BlockKind;
  /** The list's name; the kind's word when null. */
  name: string | null;
  screen: BuilderScreen;
  startMin: number;
  endMin: number;
  items: PreviewItem[];
  /** The routine's room before B11 has built it — drawn as an open band (v1.3 §4.4 B7). */
  open?: boolean;
  /** A training band's placement — `after_work` is not *so far*. */
  placement?: string;
};

export type PreviewSlack = { key: string; startMin: number; endMin: number; before: string; after: string };

export type DayPreview = {
  startMin: number;
  endMin: number;
  blocks: PreviewBlock[];
  slack: PreviewSlack[];
};

export type PreviewParts = {
  plan: DayPlanView;
  times: EffectiveTimes;
  orientMin: number;
  prep: { templateId: string; slots: readonly SlotView[] } | null;
  morning: { templateId: string; slots: readonly SlotView[] } | null;
  windDown: { templateId: string; slots: readonly SlotView[] } | null;
  habits: readonly HabitSummaryView[];
  fixtures: readonly FixtureView[];
  /** The two placed wind-down rows' lengths (§7.1). */
  journalMin: number;
  /** B7: with no routine yet, draw its room as an open band. */
  openMorning?: boolean;
};

const NO_ICON: IconValue | null = null;

function placeList(
  list: { templateId: string; slots: readonly SlotView[] } | null,
  flow: "forward" | "backward",
  anchorMin: number,
  bound: number | null,
): { items: PreviewItem[]; startMin: number; endMin: number } | null {
  if (list === null) return null;
  const onWalk = list.slots.filter((slot) => slot.role !== "pool");
  if (onWalk.length === 0) return null;
  const result = stackBlock({ items: toStackItems(onWalk), flow, anchorMin, bound });
  if (result.placed.length === 0) return null;
  const byId = new Map(onWalk.map((slot) => [slot.id, slot]));
  const items: PreviewItem[] = [];
  for (const placed of result.placed) {
    const slot = byId.get(placed.id);
    if (slot === undefined) continue;
    items.push({
      id: slot.id,
      title: slot.title,
      icon: slot.icon,
      startMin: placed.startMin,
      endMin: placed.endMin,
      slot: { templateId: list.templateId, slot },
      pinned: slot.pinnedClock !== null,
    });
  }
  return { items, startMin: result.startMin, endMin: result.endMin };
}

/** A fixture at its clock, with its planned travel as thin ends either side (TD-27). */
function fixtureItems(fixture: FixtureView, at: number): PreviewItem[] {
  const items: PreviewItem[] = [];
  const planned = fixture.travel.planned;
  const there = planned ? fixture.travel.thereMin : 0;
  const back = planned ? fixture.travel.backMin : 0;
  if (there > 0) {
    items.push({ id: `fixture-${fixture.id}-there`, title: fixture.title, icon: NO_ICON, startMin: at - there, endMin: at, travel: "there" });
  }
  items.push({ id: `fixture-${fixture.id}`, title: fixture.title, icon: fixture.icon, startMin: at, endMin: at + fixture.durationMin, pinned: true });
  if (back > 0) {
    const end = at + fixture.durationMin;
    items.push({ id: `fixture-${fixture.id}-back`, title: fixture.title, icon: NO_ICON, startMin: end, endMin: end + back, travel: "back" });
  }
  return items;
}

function workoutBlock(
  habit: HabitSummaryView,
  startMin: number,
  key: string,
  placement: string,
): PreviewBlock {
  const length = habit.durationMin ?? 30;
  const there = habit.travel?.planned ? habit.travel.thereMin : 0;
  const back = habit.travel?.planned ? habit.travel.backMin : 0;
  const items: PreviewItem[] = [];
  let cursor = startMin;
  if (there > 0) {
    items.push({ id: `${habit.id}-there`, title: habit.title, icon: NO_ICON, startMin: cursor, endMin: cursor + there, travel: "there" });
    cursor += there;
  }
  items.push({ id: habit.id, title: habit.title, icon: habit.icon, startMin: cursor, endMin: cursor + length });
  cursor += length;
  if (back > 0) {
    items.push({ id: `${habit.id}-back`, title: habit.title, icon: NO_ICON, startMin: cursor, endMin: cursor + back, travel: "back" });
    cursor += back;
  }
  return { key, kind: "training", name: null, screen: "b04", startMin, endMin: cursor, items, placement };
}

export function buildPreview(parts: PreviewParts): DayPreview | null {
  const wake = minutesOf(parts.times.wake);
  const lightsOut = minutesOf(parts.times.lightsOut);
  if (wake === null || lightsOut === null) return null;
  const end = lightsOut < wake ? lightsOut + 24 * 60 : lightsOut;
  const workStart = minutesOf(parts.times.workStart);
  const workEnd = minutesOf(parts.times.workEnd);
  const devicesOffRaw = minutesOf(parts.times.devicesOff);
  const devicesOff = devicesOffRaw === null ? null : devicesOffRaw < wake ? devicesOffRaw + 24 * 60 : devicesOffRaw;

  const blocks: PreviewBlock[] = [];
  const habitById = new Map(parts.habits.map((habit) => [habit.id, habit]));
  // One band per entry, in the list's order (TD-24; DAY-6) — the order inside a placement is the list's.
  const training = (placement: string) =>
    parts.plan.trainingPlan
      .map((entry, index) => ({ entry, index, habit: habitById.get(entry.habitId) }))
      .filter(
        (row): row is { entry: (typeof parts.plan.trainingPlan)[number]; index: number; habit: HabitSummaryView } =>
          row.entry.placement === placement && row.habit !== undefined,
      );
  const trainingBlock = (row: { index: number; habit: HabitSummaryView }, startMin: number, placement: string) =>
    workoutBlock(row.habit, startMin, `training-${row.index}-${row.habit.id}`, placement);

  // Orient — at wake, the orient template's length.
  let cursor = wake;
  if (parts.orientMin > 0) {
    blocks.push({
      key: "orient",
      kind: "orient",
      name: null,
      screen: "b02",
      startMin: wake,
      endMin: wake + parts.orientMin,
      items: [],
    });
    cursor = wake + parts.orientMin;
  }

  // Getting ready — backward to *working by*; forward after the routine on a no-work day.
  const prepBackward = workStart !== null ? placeList(parts.prep, "backward", workStart, cursor) : null;
  const morningBound = prepBackward === null ? (workStart ?? null) : prepBackward.startMin;

  // Training before the routine.
  for (const row of training("before_morning")) {
    const block = trainingBlock(row, cursor, "before_morning");
    blocks.push(block);
    cursor = block.endMin;
  }

  // Training after the routine takes its time out of the routine's room.
  const afterMorning = training("after_morning");

  // The routine — forward from here, bounded by getting ready (or work).
  const morning = placeList(parts.morning, "forward", cursor, morningBound);
  if (morning !== null) {
    blocks.push({
      key: "morning",
      kind: "morning",
      name: parts.plan.morning?.name ?? null,
      screen: "b11",
      startMin: morning.startMin,
      endMin: morning.endMin,
      items: morning.items,
    });
    cursor = morning.endMin;
  } else if (parts.openMorning === true && parts.plan.morning === null && morningBound !== null) {
    // B7: the routine's room, open — what is left before getting ready once the after-routine workouts are out.
    // With nothing bounding it (a *No work* day with no list yet) it has no room to draw.
    const afterLength = afterMorning.reduce((sum, row) => sum + workoutBlock(row.habit, 0, "", "").endMin, 0);
    const roomEnd = morningBound - afterLength;
    if (roomEnd > cursor) {
      blocks.push({ key: "morning", kind: "morning", name: null, screen: "b11", startMin: cursor, endMin: roomEnd, items: [], open: true });
      cursor = roomEnd;
    }
  }

  // Training after the routine.
  for (const row of afterMorning) {
    const block = trainingBlock(row, cursor, "after_morning");
    blocks.push(block);
    cursor = block.endMin;
  }

  // Getting ready in place.
  const prep = prepBackward ?? (workStart === null ? placeList(parts.prep, "forward", cursor, null) : null);
  if (prep !== null) {
    blocks.push({
      key: "prep",
      kind: "prep",
      name: parts.plan.gettingReady?.name ?? null,
      screen: "b05",
      startMin: prep.startMin,
      endMin: prep.endMin,
      items: prep.items,
    });
    cursor = Math.max(cursor, prep.endMin);
  }

  // Work, with breaks and midday training inside.
  if (workStart !== null && workEnd !== null && parts.plan.work !== null) {
    const items: PreviewItem[] = [];
    const midday = Math.round((workStart + workEnd) / 2);
    let inside = midday;
    for (const row of training("inside_work")) {
      const block = trainingBlock(row, inside, "inside_work");
      blocks.push(block);
      inside = block.endMin;
    }
    for (const entry of parts.plan.breaks) {
      const habit = habitById.get(entry.habitId);
      if (habit === undefined) continue;
      const at = entry.at === "midday" ? inside : (minutesOf(entry.at) ?? inside);
      const length = habit.durationMin ?? 10;
      items.push({ id: `break-${habit.id}`, title: habit.title, icon: habit.icon, startMin: at, endMin: at + length });
      if (entry.at === "midday") inside = at + length;
    }
    for (const fixture of parts.fixtures) {
      if (fixture.blockKind !== "work") continue;
      const at = minutesOf(fixture.atClock);
      if (at === null) continue;
      items.push(...fixtureItems(fixture, at));
    }
    blocks.push({
      key: "work",
      kind: "work",
      name: parts.plan.work.name,
      screen: "b03",
      startMin: workStart,
      endMin: workEnd,
      items: items.sort((a, b) => a.startMin - b.startMin),
    });
    cursor = workEnd;
  }

  // Training after work.
  for (const row of training("after_work")) {
    const block = trainingBlock(row, cursor, "after_work");
    blocks.push(block);
    cursor = block.endMin;
  }

  // The evening's fixtures, each at its clock.
  const evening = parts.fixtures
    .filter((fixture) => fixture.blockKind !== "work")
    .map((fixture) => ({ fixture, at: minutesOf(fixture.atClock) }))
    .filter((entry): entry is { fixture: FixtureView; at: number } => entry.at !== null)
    .map((entry) => ({ fixture: entry.fixture, at: entry.at < wake ? entry.at + 24 * 60 : entry.at }))
    .sort((a, b) => a.at - b.at);
  if (evening.length > 0) {
    const first = evening[0];
    const last = evening[evening.length - 1];
    if (first !== undefined && last !== undefined) {
      blocks.push({
        key: "activity",
        kind: "activity",
        name: null,
        screen: "b06",
        startMin: first.at,
        endMin: Math.max(...evening.map((entry) => entry.at + entry.fixture.durationMin)),
        items: evening.flatMap(({ fixture, at }) => fixtureItems(fixture, at)),
      });
    }
  }

  // The wind-down — backward to phone away, then the journal, then lights out.
  const phoneAway = devicesOff ?? end;
  const journalEnd = phoneAway;
  const journalStart = journalEnd - parts.journalMin;
  const windDown = placeList(parts.windDown, "backward", journalStart, cursor);
  const windItems: PreviewItem[] = windDown?.items ?? [];
  if (parts.journalMin > 0) {
    windItems.push({ id: "journal", title: COPY.b12.aFewLines, icon: NO_ICON, startMin: journalStart, endMin: journalEnd, pinned: true });
  }
  if (devicesOff !== null) {
    windItems.push({ id: "phone-away", title: COPY.b12.phoneAway, icon: NO_ICON, startMin: phoneAway, endMin: phoneAway + 1, pinned: true });
  }
  blocks.push({
    key: "wind_down",
    kind: "wind_down",
    name: parts.plan.windDown?.name ?? null,
    screen: "b12",
    startMin: windDown?.startMin ?? journalStart,
    endMin: end,
    items: windItems,
  });

  blocks.sort((a, b) => a.startMin - b.startMin);

  // Slack — the room between one block's end and the next's start.
  const slack: PreviewSlack[] = [];
  for (let index = 1; index < blocks.length; index += 1) {
    const before = blocks[index - 1];
    const after = blocks[index];
    if (before === undefined || after === undefined) continue;
    const gap = after.startMin - before.endMin;
    if (gap >= 5) {
      slack.push({ key: `slack-${before.key}-${after.key}`, startMin: before.endMin, endMin: after.startMin, before: before.key, after: after.key });
    }
  }

  return {
    startMin: Math.min(wake, ...blocks.map((block) => block.startMin)),
    endMin: Math.max(end, ...blocks.map((block) => block.endMin)),
    blocks,
    slack,
  };
}

/**
 * B7's strip — v1.3 §4.4 B7, R67 (DAY-9): the review's preview CUT AT THE END
 * OF WORK — *up at* to *until about* — or, on a *No work* day, to the end of
 * the last block placed so far. The evening's fixtures, the after-work
 * workouts and the wind-down are after work, so none of them is *so far*.
 */
export function cutAtWorkEnd(preview: DayPreview): DayPreview {
  const later = (block: PreviewBlock) =>
    block.kind === "wind_down" || block.kind === "activity" || (block.kind === "training" && block.placement === "after_work");
  const work = preview.blocks.find((block) => block.kind === "work");
  const early = preview.blocks.filter((block) => !later(block));
  const endMin = work?.endMin ?? Math.max(preview.startMin, ...early.map((block) => block.endMin));
  const blocks = early.filter((block) => block.startMin < endMin);
  return {
    startMin: preview.startMin,
    endMin,
    blocks,
    slack: preview.slack.filter((gap) => gap.endMin <= endMin && blocks.some((block) => block.key === gap.after)),
  };
}
