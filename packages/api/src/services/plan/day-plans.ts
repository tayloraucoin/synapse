import { and, asc, eq, inArray, isNull, ne } from "drizzle-orm";

import { dayPlans, habits, templates, type RlsClient } from "@syn/db";
import type {
  DayPlanBreak,
  DayPlanSummaryView,
  DayPlanTraining,
  DayPlanView,
  IconValue,
  TrainingPlacement,
  Weekday,
  WorkDayMode,
} from "@syn/types";
import type { DayPlanPatchInput } from "@syn/validators";
import { formatClockFromMinutes } from "@syn/utils";

import { readPreferences, type UserPreferencesRow } from "../user/preferences";
import { listTemplates } from "./templates";

/**
 * Day plans — UX v1.2 §3.13, §4.13, §11.5 (R31, TD-10).
 *
 * A PLAN IS A ROW OF REFERENCES. It points at a work template (the type), at
 * up to three block templates (the named lists), and carries the four times
 * a day is anchored from (null = inherit), the workouts placed, the breaks,
 * and the fixtures it leaves out. It copies nothing: a second plan may point
 * at *Getting ready A*, and editing that list edits every plan that uses it.
 * Deleting a plan deletes references only.
 *
 * ONE PLAN PER WEEKDAY, per person — enforced here on every write (an array
 * cannot carry it as a constraint). A weekday already held by another plan
 * MOVES, and the response says so (`moved`), so the builder's line
 * *Thursday moves from Day A.* is a report, not a question.
 *
 * THE FIRST PLAN PRESELECTS every *Always* and *Sometimes* weekday (v1.2 §13
 * #19); later plans start with none. Names run *Day A* … *Day Z*, *Day AA*.
 *
 * NOTHING HERE MATERIALISES. `prefillWeek` (RUN-5) reads a weekday's plan
 * first; `saveMorning`'s *Set from the plan* calls `confirmDay` (TD-17).
 */

export type DayPlanRuleCode =
  | "not_found"
  | "needs_days"
  | "needs_wake"
  | "needs_lights_out"
  | "needs_work";

export class DayPlanRuleError extends Error {
  readonly code: DayPlanRuleCode;
  constructor(code: DayPlanRuleCode) {
    super(code);
    this.name = "DayPlanRuleError";
    this.code = code;
  }
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: dayPlans.id,
  name: dayPlans.name,
  icon: dayPlans.icon,
  weekdays: dayPlans.weekdays,
  state: dayPlans.state,
  wakeTime: dayPlans.wakeTime,
  workStartTime: dayPlans.workStartTime,
  workEndTime: dayPlans.workEndTime,
  lightsOutTime: dayPlans.lightsOutTime,
  devicesOffTime: dayPlans.devicesOffTime,
  workTemplateId: dayPlans.workTemplateId,
  prepTemplateId: dayPlans.prepTemplateId,
  morningTemplateId: dayPlans.morningTemplateId,
  windDownTemplateId: dayPlans.windDownTemplateId,
  training: dayPlans.training,
  breaks: dayPlans.breaks,
  excludedFixtureIds: dayPlans.excludedFixtureIds,
  sortOrder: dayPlans.sortOrder,
  createdAt: dayPlans.createdAt,
} as const;

export type DayPlanRow = {
  id: string;
  name: string;
  icon: IconValue | null;
  weekdays: number[];
  state: "draft" | "complete";
  wakeTime: string | null;
  workStartTime: string | null;
  workEndTime: string | null;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  workTemplateId: string | null;
  prepTemplateId: string | null;
  morningTemplateId: string | null;
  windDownTemplateId: string | null;
  training: DayPlanTraining[];
  breaks: DayPlanBreak[];
  excludedFixtureIds: string[];
  sortOrder: number;
  createdAt: Date;
};

const clock = (value: string | null): string | null => (value === null ? null : value.slice(0, 5));

function toRow(row: {
  [K in keyof DayPlanRow]: DayPlanRow[K];
}): DayPlanRow {
  return {
    ...row,
    wakeTime: clock(row.wakeTime),
    workStartTime: clock(row.workStartTime),
    workEndTime: clock(row.workEndTime),
    lightsOutTime: clock(row.lightsOutTime),
    devicesOffTime: clock(row.devicesOffTime),
  };
}

/* ---------------------------------------------------------------- reads -- */

export async function readPlanRows(tx: Tx, userId: string): Promise<DayPlanRow[]> {
  const rows = await tx
    .select(COLUMNS)
    .from(dayPlans)
    .where(eq(dayPlans.userId, userId))
    .orderBy(asc(dayPlans.sortOrder), asc(dayPlans.createdAt));
  return rows.map(toRow);
}

/** The complete plan that claims a weekday, or null. Exported for `prefillWeek`. */
export async function planForWeekday(
  tx: Tx,
  userId: string,
  weekday: number,
): Promise<DayPlanRow | null> {
  const rows = await readPlanRows(tx, userId);
  // A double claim is impossible through the service; if one slipped through,
  // the lower sort order wins (TD-10's stated rule) — `readPlanRows` is sorted.
  return rows.find((row) => row.state === "complete" && row.weekdays.includes(weekday)) ?? null;
}

/**
 * The resolved anchors a plan implies — its own value, else the type's, else
 * the profile's (UX v1.2 §3.13). One function so the summary, the week build
 * and the builder's room line agree.
 */
export function resolvePlanAnchors(
  plan: DayPlanRow,
  workType: { startClock: string | null; endClock: string | null } | null,
  profile: Pick<UserPreferencesRow, "usualWakeTime" | "workStartTime" | "workEndTime" | "lightsOutTime" | "devicesOffTimeEffective">,
): {
  wake: string;
  workStart: string | null;
  workEnd: string | null;
  lightsOut: string | null;
  devicesOff: string | null;
} {
  const noWork = plan.workTemplateId === null;
  return {
    wake: plan.wakeTime ?? profile.usualWakeTime.slice(0, 5),
    workStart: noWork ? null : (plan.workStartTime ?? workType?.startClock ?? clock(profile.workStartTime)),
    workEnd: noWork ? null : (plan.workEndTime ?? workType?.endClock ?? clock(profile.workEndTime)),
    lightsOut: plan.lightsOutTime ?? clock(profile.lightsOutTime),
    devicesOff: plan.devicesOffTime ?? clock(profile.devicesOffTimeEffective),
  };
}

async function toViews(
  rls: RlsClient,
  userId: string,
  rows: readonly DayPlanRow[],
): Promise<DayPlanView[]> {
  if (rows.length === 0) return [];
  const [prefs, templateViews] = await Promise.all([
    readPreferences(rls, userId),
    listTemplates(rls, userId, { includeArchived: false }),
  ]);
  if (!prefs) return [];
  const templateById = new Map(templateViews.map((view) => [view.id, view]));

  const workoutIds = [...new Set(rows.flatMap((row) => row.training.map((entry) => entry.habitId)))];
  const workTemplateIds = [
    ...new Set(rows.map((row) => row.workTemplateId).filter((id): id is string => id !== null)),
  ];
  const { workouts, workClocks } = await rls.execute(async (tx) => ({
    workouts: workoutIds.length
      ? await tx
          .select({ id: habits.id, title: habits.title, icon: habits.icon })
          .from(habits)
          .where(and(eq(habits.userId, userId), inArray(habits.id, workoutIds)))
      : [],
    // The type's `HH:mm` clocks, raw — the summary view formats them for display.
    workClocks: workTemplateIds.length
      ? await tx
          .select({ id: templates.id, anchorTime: templates.anchorTime, workEndTime: templates.workEndTime })
          .from(templates)
          .where(and(eq(templates.userId, userId), inArray(templates.id, workTemplateIds)))
      : [],
  }));
  const workoutById = new Map(workouts.map((row) => [row.id, row]));
  const clocksById = new Map(
    workClocks.map((row) => [
      row.id,
      { startClock: clock(row.anchorTime), endClock: clock(row.workEndTime) },
    ]),
  );

  const list = (id: string | null) => {
    if (id === null) return null;
    const view = templateById.get(id);
    return view ? { templateId: id, name: view.name, totalMin: view.totalMin } : null;
  };

  return rows.map((row) => {
    const workView = row.workTemplateId === null ? undefined : templateById.get(row.workTemplateId);
    const anchors = resolvePlanAnchors(
      row,
      row.workTemplateId === null ? null : (clocksById.get(row.workTemplateId) ?? null),
      prefs,
    );
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      weekdays: [...row.weekdays].sort((a, b) => a - b) as Weekday[],
      state: row.state,
      work: workView
        ? { templateId: workView.id, name: workView.name, icon: workView.workDayType?.icon ?? null }
        : null,
      wakeClock: display(anchors.wake),
      workStartClock: display(anchors.workStart),
      workEndClock: display(anchors.workEnd),
      lightsOutClock: display(anchors.lightsOut),
      training: row.training.flatMap((entry) => {
        const workout = workoutById.get(entry.habitId);
        return workout
          ? [{ habitId: entry.habitId, title: workout.title, icon: workout.icon, placement: entry.placement }]
          : [];
      }),
      gettingReady: list(row.prepTemplateId),
      morning: list(row.morningTemplateId),
      windDown: list(row.windDownTemplateId),
      wakeTime: row.wakeTime,
      workStartTime: row.workStartTime,
      workEndTime: row.workEndTime,
      lightsOutTime: row.lightsOutTime,
      devicesOffTime: row.devicesOffTime,
      trainingPlan: row.training,
      breaks: row.breaks,
      excludedFixtureIds: row.excludedFixtureIds,
      sortOrder: row.sortOrder,
    };
  });
}

function display(clockValue: string | null): string | null {
  if (clockValue === null) return null;
  const [h = "0", m = "0"] = clockValue.split(":");
  return formatClockFromMinutes(Number(h) * 60 + Number(m));
}

export async function listDayPlans(
  rls: RlsClient,
  userId: string,
  options: { state?: "draft" | "complete" } = {},
): Promise<DayPlanSummaryView[]> {
  const rows = await rls.execute((tx) => readPlanRows(tx, userId));
  const filtered = options.state ? rows.filter((row) => row.state === options.state) : rows;
  return toViews(rls, userId, filtered);
}

export async function getDayPlan(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<DayPlanView | null> {
  const rows = await rls.execute((tx) => readPlanRows(tx, userId));
  const row = rows.find((entry) => entry.id === id);
  if (!row) return null;
  const [view] = await toViews(rls, userId, [row]);
  return view ?? null;
}

/* --------------------------------------------------------------- writes -- */

/** *Day A* … *Day Z*, then *Day AA*, *Day AB* … — the first name not taken. */
export function nextPlanName(taken: ReadonlySet<string>): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let n = 0; ; n += 1) {
    let label = "";
    let i = n;
    do {
      label = letters[i % 26] + label;
      i = Math.floor(i / 26) - 1;
    } while (i >= 0);
    const name = `Day ${label}`;
    if (!taken.has(name)) return name;
  }
}

function workingWeekdays(workDays: Partial<Record<string, WorkDayMode>> | null): number[] {
  const days: number[] = [];
  for (let weekday = 0; weekday <= 6; weekday += 1) {
    const mode = workDays?.[String(weekday)] ?? (weekday < 5 ? "always" : "never");
    if (mode === "always" || mode === "sometimes") days.push(weekday);
  }
  return days;
}

export async function createDayPlan(
  rls: RlsClient,
  userId: string,
  input: { name?: string } = {},
): Promise<DayPlanView> {
  const created = await rls.execute(async (tx) => {
    const existing = await readPlanRows(tx, userId);
    const name = input.name ?? nextPlanName(new Set(existing.map((row) => row.name)));
    const prefs = await readPreferences(rls, userId);
    const weekdays = existing.length === 0 ? workingWeekdays(prefs?.workDays ?? null) : [];
    const sortOrder = existing.length === 0 ? 0 : Math.max(...existing.map((row) => row.sortOrder)) + 1;

    const [row] = await tx
      .insert(dayPlans)
      .values({ userId, name, weekdays, sortOrder })
      .returning({ id: dayPlans.id });
    if (!row) throw new Error("day_plans insert returned no row");
    return row.id;
  });
  const view = await getDayPlan(rls, userId, created);
  if (!view) throw new Error("day plan vanished after insert");
  return view;
}

export type MovedWeekday = { weekday: number; fromPlanId: string; fromPlanName: string };

/**
 * A patch, one part at a time. A weekday another plan holds moves to this one
 * and is reported; the two writes are one transaction.
 */
export async function updateDayPlan(
  rls: RlsClient,
  userId: string,
  id: string,
  patch: DayPlanPatchInput,
): Promise<{ plan: DayPlanView; moved: MovedWeekday[] } | null> {
  const moved: MovedWeekday[] = [];

  const ok = await rls.execute(async (tx) => {
    const [target] = await tx
      .select({ id: dayPlans.id })
      .from(dayPlans)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)))
      .limit(1);
    if (!target) return false;

    if (patch.weekdays !== undefined) {
      const wanted = [...new Set(patch.weekdays)].sort((a, b) => a - b);
      const others = await tx
        .select({ id: dayPlans.id, name: dayPlans.name, weekdays: dayPlans.weekdays })
        .from(dayPlans)
        .where(and(eq(dayPlans.userId, userId), ne(dayPlans.id, id)));
      for (const other of others) {
        const overlap = other.weekdays.filter((weekday) => wanted.includes(weekday));
        if (overlap.length === 0) continue;
        for (const weekday of overlap) {
          moved.push({ weekday, fromPlanId: other.id, fromPlanName: other.name });
        }
        await tx
          .update(dayPlans)
          .set({
            weekdays: other.weekdays.filter((weekday) => !wanted.includes(weekday)),
            updatedAt: new Date(),
          })
          .where(eq(dayPlans.id, other.id));
      }
    }

    const set = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
      ...(patch.weekdays !== undefined
        ? { weekdays: [...new Set(patch.weekdays)].sort((a, b) => a - b) }
        : {}),
      ...(patch.workTemplateId !== undefined ? { workTemplateId: patch.workTemplateId } : {}),
      ...(patch.wakeTime !== undefined ? { wakeTime: patch.wakeTime } : {}),
      ...(patch.workStartTime !== undefined ? { workStartTime: patch.workStartTime } : {}),
      ...(patch.workEndTime !== undefined ? { workEndTime: patch.workEndTime } : {}),
      ...(patch.lightsOutTime !== undefined ? { lightsOutTime: patch.lightsOutTime } : {}),
      ...(patch.devicesOffTime !== undefined ? { devicesOffTime: patch.devicesOffTime } : {}),
      ...(patch.prepTemplateId !== undefined ? { prepTemplateId: patch.prepTemplateId } : {}),
      ...(patch.morningTemplateId !== undefined
        ? { morningTemplateId: patch.morningTemplateId }
        : {}),
      ...(patch.windDownTemplateId !== undefined
        ? { windDownTemplateId: patch.windDownTemplateId }
        : {}),
      ...(patch.training !== undefined ? { training: [...patch.training] } : {}),
      ...(patch.breaks !== undefined ? { breaks: [...patch.breaks] } : {}),
      ...(patch.excludedFixtureIds !== undefined
        ? { excludedFixtureIds: [...patch.excludedFixtureIds] }
        : {}),
      ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
      updatedAt: new Date(),
    };

    await tx
      .update(dayPlans)
      .set(set)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)));
    return true;
  });

  if (!ok) return null;
  const plan = await getDayPlan(rls, userId, id);
  return plan ? { plan, moved } : null;
}

/**
 * `state → complete` (v1.2 §4.13i). Requires a weekday, a wake and a
 * lights-out (own or inherited), and a work template or an explicit *no
 * work*. The three list FKs may be null — a plan with no routine is honest.
 */
export async function completeDayPlan(
  rls: RlsClient,
  userId: string,
  id: string,
  options: { noWork?: boolean } = {},
): Promise<DayPlanView | null> {
  const prefs = await readPreferences(rls, userId);
  const done = await rls.execute(async (tx) => {
    const rows = await readPlanRows(tx, userId);
    const row = rows.find((entry) => entry.id === id);
    if (!row) return false;
    if (row.weekdays.length === 0) throw new DayPlanRuleError("needs_days");
    if (row.wakeTime === null && !prefs?.usualWakeTime) throw new DayPlanRuleError("needs_wake");
    if (row.lightsOutTime === null && !prefs?.lightsOutTime) {
      throw new DayPlanRuleError("needs_lights_out");
    }
    if (row.workTemplateId === null && options.noWork !== true) {
      throw new DayPlanRuleError("needs_work");
    }
    await tx
      .update(dayPlans)
      .set({ state: "complete", updatedAt: new Date() })
      .where(eq(dayPlans.id, id));
    return true;
  });
  if (!done) return null;
  return getDayPlan(rls, userId, id);
}

/** The same seven references, `draft`, no weekdays, the next name. Templates are not copied. */
export async function duplicateDayPlan(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<DayPlanView | null> {
  const created = await rls.execute(async (tx) => {
    const rows = await readPlanRows(tx, userId);
    const source = rows.find((entry) => entry.id === id);
    if (!source) return null;
    const name = nextPlanName(new Set(rows.map((row) => row.name)));
    const [row] = await tx
      .insert(dayPlans)
      .values({
        userId,
        name,
        icon: source.icon,
        weekdays: [],
        state: "draft",
        wakeTime: source.wakeTime,
        workStartTime: source.workStartTime,
        workEndTime: source.workEndTime,
        lightsOutTime: source.lightsOutTime,
        devicesOffTime: source.devicesOffTime,
        workTemplateId: source.workTemplateId,
        prepTemplateId: source.prepTemplateId,
        morningTemplateId: source.morningTemplateId,
        windDownTemplateId: source.windDownTemplateId,
        training: source.training,
        breaks: source.breaks,
        excludedFixtureIds: source.excludedFixtureIds,
        sortOrder: Math.max(...rows.map((entry) => entry.sortOrder)) + 1,
      })
      .returning({ id: dayPlans.id });
    return row?.id ?? null;
  });
  if (!created) return null;
  return getDayPlan(rls, userId, created);
}

/** Hard-deletes the row — it is composition, not record; nothing on a day points at a plan. */
export async function deleteDayPlan(rls: RlsClient, userId: string, id: string): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .delete(dayPlans)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)))
      .returning({ id: dayPlans.id }),
  );
  return rows.length > 0;
}

/* ---------------------------------------------------------- the week -- */

/**
 * What the week build reads for one weekday (RUN-5): the plan's parts as
 * `materializeInTx` wants them — the block assignments, the anchors, the
 * first placed workout, the exclusions — or null when no complete plan
 * claims the weekday.
 */
export type PlannedDay = {
  plan: DayPlanRow;
  anchors: {
    wake: string;
    workStart: string | null;
    workEnd: string | null;
    lightsOut: string | null;
    devicesOff: string | null;
  };
  /** The first placed workout; RUN-5 places one per day (see DEVIATIONS). */
  workout: { habitId: string; placement: TrainingPlacement } | null;
};

export async function plannedDayFor(
  tx: Tx,
  userId: string,
  prefs: UserPreferencesRow,
  weekday: number,
): Promise<PlannedDay | null> {
  const plan = await planForWeekday(tx, userId, weekday);
  if (!plan) return null;

  let type: { startClock: string | null; endClock: string | null } | null = null;
  if (plan.workTemplateId !== null) {
    const [row] = await tx
      .select({ anchorTime: templates.anchorTime, workEndTime: templates.workEndTime })
      .from(templates)
      .where(
        and(
          eq(templates.id, plan.workTemplateId),
          eq(templates.userId, userId),
          isNull(templates.archivedAt),
        ),
      )
      .limit(1);
    type = row ? { startClock: clock(row.anchorTime), endClock: clock(row.workEndTime) } : null;
  }

  return {
    plan,
    anchors: resolvePlanAnchors(plan, type, prefs),
    workout: plan.training[0] ?? null,
  };
}

