import { and, asc, eq, inArray, isNull, ne } from "drizzle-orm";

import { WORK_DAY_KINDS } from "@syn/constants";
import { dayPlans, habits, templates, users, type RlsClient } from "@syn/db";
import type {
  AnchorDirection,
  DayPlanBreak,
  DayPlanSummaryView,
  DayPlanTraining,
  DayPlanView,
  IconValue,
  TrainingPlacement,
  Weekday,
  WorkDayKind,
  WorkDayMode,
  WorkPlanView,
} from "@syn/types";
import type { DayPlanPatchInput } from "@syn/validators";
import { formatClockFromMinutes } from "@syn/utils";

import { readPreferences, type UserPreferencesRow } from "../user/preferences";
import { defaultFlowFor } from "./anchors";
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
 * UX v1.3 (DAY-5, TD-23, TD-25, TD-26): the plan OWNS its work template
 * (`ensureWorkFor`, below) and gains two list references — the after-work
 * list and the free-time pool — each kind-checked on write. The first plan
 * to complete writes its times to the profile where the profile has none.
 *
 * NOTHING HERE MATERIALISES. `prefillWeek` (RUN-5) reads a weekday's plan
 * first; `saveMorning`'s *Set from the plan* calls `confirmDay` (TD-17).
 */

export type DayPlanRuleCode =
  | "not_found"
  | "needs_days"
  | "needs_wake"
  | "needs_lights_out"
  | "needs_work"
  /** UX v1.3 (DAY-5): a list FK that points at a template of the wrong kind or shape. */
  | "wrong_kind";

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
  afterWorkTemplateId: dayPlans.afterWorkTemplateId,
  activityTemplateId: dayPlans.activityTemplateId,
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
  /** v1.3 TD-25: the after-work list, a `transition` template. */
  afterWorkTemplateId: string | null;
  /** v1.3 TD-26: the free-time pool, an `activity` template of structure `opener_pool_closer`. */
  activityTemplateId: string | null;
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
      afterWork: list(row.afterWorkTemplateId),
      evenings: list(row.activityTemplateId),
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
    // v1.3 R49: *Usually* is planned as work, so it is a work day here too.
    if (mode === "always" || mode === "usually" || mode === "sometimes") days.push(weekday);
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

/* ---------------------------------------------- the plan's own work -- */

/**
 * THE PLAN OWNS ITS WORK (UX v1.3 R46, §3.8, TD-23). A plan's work is a
 * `templates` row of kind `work` created by `ensureWorkFor` from the plan's
 * own write, named after the plan, renamed with it, archived when the plan
 * says *No work* or is deleted, and never shared: `duplicateDayPlan` makes the
 * copy its own. Nothing else creates one for a plan.
 *
 * A v1.2 TYPE MAY STILL BE SHARED. Before v1.3 a plan picked a work-day type,
 * and two plans could point at one (*Remote*). Nothing on disk marks a row as
 * a plan's own, so ownership is read: a work template another plan also
 * references is shared, and a plan never renames, patches or archives it —
 * its first v1.3 work write makes it its own template instead, copying the
 * shared one's values.
 */
type WorkFields = NonNullable<DayPlanPatchInput["work"]>;

async function sharedWithAnotherPlan(
  tx: Tx,
  userId: string,
  templateId: string,
  planId: string,
): Promise<boolean> {
  const [other] = await tx
    .select({ id: dayPlans.id })
    .from(dayPlans)
    .where(
      and(
        eq(dayPlans.userId, userId),
        ne(dayPlans.id, planId),
        eq(dayPlans.workTemplateId, templateId),
      ),
    )
    .limit(1);
  return other !== undefined;
}

const kindGlyph = (kind: WorkDayKind | null): IconValue | null =>
  kind === null ? null : (WORK_DAY_KINDS.find((entry) => entry.key === kind)?.icon ?? null);

/**
 * Create the plan's work template on its first work fact, or patch the one it
 * owns — `kind` (with the kind's glyph), *working by*, *until about*, *what
 * gives*. Returns the template id and writes the plan's FK. Never touches the
 * profile: the profile's defaults are the first COMPLETE plan's
 * (`completeDayPlan`), not the first work fact's.
 */
export async function ensureWorkFor(
  tx: Tx,
  userId: string,
  planId: string,
  fields: WorkFields,
): Promise<string> {
  const [plan] = await tx
    .select({ name: dayPlans.name, workTemplateId: dayPlans.workTemplateId })
    .from(dayPlans)
    .where(and(eq(dayPlans.id, planId), eq(dayPlans.userId, userId)))
    .limit(1);
  if (!plan) throw new DayPlanRuleError("not_found");

  const patch = {
    ...(fields.kind !== undefined ? { locationKind: fields.kind, icon: kindGlyph(fields.kind) } : {}),
    ...(fields.workStart !== undefined ? { anchorTime: fields.workStart } : {}),
    ...(fields.workEnd !== undefined ? { workEndTime: fields.workEnd } : {}),
    ...(fields.direction !== undefined ? { anchorDirection: fields.direction } : {}),
  };

  // The row the plan points at now: patch it if the plan owns it; copy it if it is shared.
  let base: {
    anchorTime: string | null;
    workEndTime: string | null;
    locationKind: WorkDayKind | null;
    anchorDirection: AnchorDirection | null;
    icon: IconValue | null;
  } | null = null;
  if (plan.workTemplateId !== null) {
    const [current] = await tx
      .select({
        id: templates.id,
        kind: templates.kind,
        archivedAt: templates.archivedAt,
        anchorTime: templates.anchorTime,
        workEndTime: templates.workEndTime,
        locationKind: templates.locationKind,
        anchorDirection: templates.anchorDirection,
        icon: templates.icon,
      })
      .from(templates)
      .where(and(eq(templates.id, plan.workTemplateId), eq(templates.userId, userId)))
      .limit(1);
    if (current && current.kind === "work" && current.archivedAt === null) {
      if (!(await sharedWithAnotherPlan(tx, userId, current.id, planId))) {
        await tx
          .update(templates)
          .set({ ...patch, name: plan.name, updatedAt: new Date() })
          .where(and(eq(templates.id, current.id), eq(templates.userId, userId)));
        return current.id;
      }
      base = current;
    }
  }

  const [created] = await tx
    .insert(templates)
    .values({
      userId,
      name: plan.name,
      kind: "work",
      flow: defaultFlowFor("work"),
      structure: "stack",
      anchorTime: base?.anchorTime ?? null,
      workEndTime: base?.workEndTime ?? null,
      locationKind: base?.locationKind ?? null,
      anchorDirection: base?.anchorDirection ?? null,
      icon: base?.icon ?? null,
      ...patch,
    })
    .returning({ id: templates.id });
  if (!created) throw new Error("work template insert returned no row");

  await tx
    .update(dayPlans)
    .set({ workTemplateId: created.id, updatedAt: new Date() })
    .where(and(eq(dayPlans.id, planId), eq(dayPlans.userId, userId)));
  return created.id;
}

/** Archive the plan's own work template — never a shared one, never a delete (a day may point at it). */
async function archiveOwnedWork(
  tx: Tx,
  userId: string,
  templateId: string,
  planId: string,
): Promise<void> {
  if (await sharedWithAnotherPlan(tx, userId, templateId, planId)) return;
  await tx
    .update(templates)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.userId, userId),
        eq(templates.kind, "work"),
        isNull(templates.archivedAt),
      ),
    );
}

/**
 * The two v1.3 list FKs are kind-checked (TD-25, TD-26): the after-work list
 * is an unarchived `transition` template; free time is an unarchived
 * `activity` template whose structure is the pool's (`opener_pool_closer`).
 */
async function assertListKind(
  tx: Tx,
  userId: string,
  templateId: string,
  kind: "transition" | "activity",
): Promise<void> {
  const [row] = await tx
    .select({ kind: templates.kind, structure: templates.structure })
    .from(templates)
    .where(
      and(eq(templates.id, templateId), eq(templates.userId, userId), isNull(templates.archivedAt)),
    )
    .limit(1);
  const ok =
    row !== undefined &&
    row.kind === kind &&
    (kind !== "activity" || row.structure === "opener_pool_closer");
  if (!ok) throw new DayPlanRuleError("wrong_kind");
}

/**
 * The plans *Working today* offers on a *Rarely* day (v1.3 §3.8, TD-23):
 * complete plans with an unarchived work template, in the plans' order,
 * labelled by the plan's name — *Working today · as Day A*.
 */
export async function listWorkPlans(rls: RlsClient, userId: string): Promise<WorkPlanView[]> {
  return rls.execute(async (tx) => {
    const plans = (await readPlanRows(tx, userId)).filter(
      (row) => row.state === "complete" && row.workTemplateId !== null,
    );
    const ids = plans.map((row) => row.workTemplateId).filter((id): id is string => id !== null);
    if (ids.length === 0) return [];
    const works = await tx
      .select({ id: templates.id, anchorTime: templates.anchorTime, workEndTime: templates.workEndTime })
      .from(templates)
      .where(and(eq(templates.userId, userId), inArray(templates.id, ids), isNull(templates.archivedAt)));
    const byId = new Map(works.map((row) => [row.id, row]));
    return plans.flatMap((plan) => {
      const work = plan.workTemplateId === null ? undefined : byId.get(plan.workTemplateId);
      if (!work) return [];
      return [
        {
          planId: plan.id,
          name: plan.name,
          icon: plan.icon,
          templateId: work.id,
          startClock: display(clock(work.anchorTime)),
          endClock: display(clock(work.workEndTime)),
        },
      ];
    });
  });
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
      .select({ id: dayPlans.id, workTemplateId: dayPlans.workTemplateId })
      .from(dayPlans)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)))
      .limit(1);
    if (!target) return false;

    // v1.3 TD-25, TD-26: a plan never points at a list of the wrong kind.
    if (patch.afterWorkTemplateId) await assertListKind(tx, userId, patch.afterWorkTemplateId, "transition");
    if (patch.activityTemplateId) await assertListKind(tx, userId, patch.activityTemplateId, "activity");

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
      ...(patch.afterWorkTemplateId !== undefined
        ? { afterWorkTemplateId: patch.afterWorkTemplateId }
        : {}),
      ...(patch.activityTemplateId !== undefined
        ? { activityTemplateId: patch.activityTemplateId }
        : {}),
      // *No work on this day* (v1.3 B3): the reference goes; the own template is archived below.
      ...(patch.work === null ? { workTemplateId: null } : {}),
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

    // v1.3 TD-23 — the plan's own work, through the plan's own writes only.
    if (patch.work === null) {
      if (target.workTemplateId !== null) await archiveOwnedWork(tx, userId, target.workTemplateId, id);
    } else if (patch.work !== undefined) {
      await ensureWorkFor(tx, userId, id, patch.work);
    } else if (patch.name !== undefined && target.workTemplateId !== null) {
      // The work template is named after the plan and follows its rename.
      if (!(await sharedWithAnotherPlan(tx, userId, target.workTemplateId, id))) {
        await tx
          .update(templates)
          .set({ name: patch.name, updatedAt: new Date() })
          .where(
            and(
              eq(templates.id, target.workTemplateId),
              eq(templates.userId, userId),
              eq(templates.kind, "work"),
            ),
          );
      }
    }
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
    // v1.3 R64: the profile's times are the first plan's — written once, by the first to complete.
    if (!rows.some((entry) => entry.id !== id && entry.state === "complete")) {
      await adoptFirstPlanDefaults(tx, userId, row);
    }
    return true;
  });
  if (!done) return null;
  return getDayPlan(rls, userId, id);
}

/**
 * UX v1.3 R64, §4.4 B2–B3 (DAY-5): times live on the plan, and the profile's
 * copies — what a day with no plan reads — are the first plan's. Each of the
 * five nullable columns is written only where it is null, from the plan's own
 * value or its work template's; the wake (`usual_wake_time`, never null — it
 * defaults to 7:00) is written when the plan has its own. A later plan never
 * overwrites: the caller runs this only for the first plan to complete. A
 * *No work* plan leaves the three work columns alone.
 */
async function adoptFirstPlanDefaults(tx: Tx, userId: string, plan: DayPlanRow): Promise<void> {
  const [profile] = await tx
    .select({
      lightsOutTime: users.lightsOutTime,
      devicesOffTime: users.devicesOffTime,
      workStartTime: users.workStartTime,
      workEndTime: users.workEndTime,
      anchorDirection: users.anchorDirection,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!profile) return;

  let work: { anchorTime: string | null; workEndTime: string | null; anchorDirection: AnchorDirection | null } | null =
    null;
  if (plan.workTemplateId !== null) {
    const [row] = await tx
      .select({
        anchorTime: templates.anchorTime,
        workEndTime: templates.workEndTime,
        anchorDirection: templates.anchorDirection,
      })
      .from(templates)
      .where(and(eq(templates.id, plan.workTemplateId), eq(templates.userId, userId)))
      .limit(1);
    work = row ?? null;
  }

  const workStart = plan.workStartTime ?? clock(work?.anchorTime ?? null);
  const workEnd = plan.workEndTime ?? clock(work?.workEndTime ?? null);
  const patch = {
    ...(plan.wakeTime !== null ? { usualWakeTime: plan.wakeTime } : {}),
    ...(profile.lightsOutTime === null && plan.lightsOutTime !== null
      ? { lightsOutTime: plan.lightsOutTime }
      : {}),
    ...(profile.devicesOffTime === null && plan.devicesOffTime !== null
      ? { devicesOffTime: plan.devicesOffTime }
      : {}),
    ...(work !== null && profile.workStartTime === null && workStart !== null
      ? { workStartTime: workStart }
      : {}),
    ...(work !== null && profile.workEndTime === null && workEnd !== null ? { workEndTime: workEnd } : {}),
    ...(work !== null && profile.anchorDirection === null && work.anchorDirection !== null
      ? { anchorDirection: work.anchorDirection }
      : {}),
  };
  if (Object.keys(patch).length === 0) return;
  await tx
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * *Build another day* (v1.3 R68): the same list references — getting ready,
 * the morning, wind-down, after work, free time — `draft`, no weekdays, the
 * next name. The lists are referenced, never copied; the WORK is the one
 * exception (TD-23): the copy gets its own work template with the source's
 * four values and the copy's name, because two plans never share one.
 */
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
        workTemplateId: null,
        prepTemplateId: source.prepTemplateId,
        morningTemplateId: source.morningTemplateId,
        windDownTemplateId: source.windDownTemplateId,
        afterWorkTemplateId: source.afterWorkTemplateId,
        activityTemplateId: source.activityTemplateId,
        training: source.training,
        breaks: source.breaks,
        excludedFixtureIds: source.excludedFixtureIds,
        sortOrder: Math.max(...rows.map((entry) => entry.sortOrder)) + 1,
      })
      .returning({ id: dayPlans.id });
    if (!row) return null;

    // The copy's own work, with the source's four values (a *No work* source gives a *No work* copy).
    if (source.workTemplateId !== null) {
      const [work] = await tx
        .select({
          anchorTime: templates.anchorTime,
          workEndTime: templates.workEndTime,
          locationKind: templates.locationKind,
          anchorDirection: templates.anchorDirection,
        })
        .from(templates)
        .where(
          and(
            eq(templates.id, source.workTemplateId),
            eq(templates.userId, userId),
            isNull(templates.archivedAt),
          ),
        )
        .limit(1);
      if (work) {
        await ensureWorkFor(tx, userId, row.id, {
          kind: work.locationKind,
          workStart: clock(work.anchorTime),
          workEnd: clock(work.workEndTime),
          direction: work.anchorDirection,
        });
      }
    }
    return row.id;
  });
  if (!created) return null;
  return getDayPlan(rls, userId, created);
}

/**
 * Hard-deletes the row — it is composition, not record; nothing on a day
 * points at a plan. Its own work template is ARCHIVED (TD-23), never deleted:
 * `days.work_template_id` may point at it. The lists are untouched.
 */
export async function deleteDayPlan(rls: RlsClient, userId: string, id: string): Promise<boolean> {
  return rls.execute(async (tx) => {
    const [plan] = await tx
      .select({ workTemplateId: dayPlans.workTemplateId })
      .from(dayPlans)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)))
      .limit(1);
    if (!plan) return false;
    const rows = await tx
      .delete(dayPlans)
      .where(and(eq(dayPlans.id, id), eq(dayPlans.userId, userId)))
      .returning({ id: dayPlans.id });
    if (rows.length === 0) return false;
    // The row is gone, so "shared" asks whether any remaining plan still points at the template.
    if (plan.workTemplateId !== null) await archiveOwnedWork(tx, userId, plan.workTemplateId, id);
    return true;
  });
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
  return plannedDayOf(tx, userId, prefs, plan);
}

/**
 * One plan by id, whatever weekday it claims — RUN-13's `week.applyPlan`
 * (UX v1.2 §4.15): the day sheet's *Plan* row puts any plan on any date.
 */
export async function plannedDayById(
  tx: Tx,
  userId: string,
  prefs: UserPreferencesRow,
  planId: string,
): Promise<PlannedDay | null> {
  const rows = await readPlanRows(tx, userId);
  const plan = rows.find((row) => row.id === planId) ?? null;
  if (!plan) return null;
  return plannedDayOf(tx, userId, prefs, plan);
}

async function plannedDayOf(
  tx: Tx,
  userId: string,
  prefs: UserPreferencesRow,
  plan: DayPlanRow,
): Promise<PlannedDay> {
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

