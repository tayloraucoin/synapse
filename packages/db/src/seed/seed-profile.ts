/**
 * Taylor's profile, rotation, and fixture — UX v1.1 §3.1, §3.7, §3.8, §3.6
 * (DYN-5's re-shaped seed).
 *
 * THE PROFILE is what the block model lays days out from: up 7:00, work
 * 9:00–17:30, lights-out 22:45, devices-off 22:15; Monday to Friday work
 * days, Saturday *sometimes*, Sunday never; the routine gets cut when the
 * morning runs long (a hard anchor); the daily menu as the overflow mode.
 *
 * THE ROTATION is habits with weekly counts and typical days (TD-3): three
 * workouts and four focuses, with Monday and Thursday as Push and Viewpoint
 * days so the acceptance probes have a known default.
 *
 * THE FIXTURE is one weekday pin: *Stand-up · Tuesday 9:30 · 20 min*, in work.
 *
 * Each part is idempotent on its own: the profile writes only while
 * `work_start_time` is unset; the rotation and the fixture skip when any row
 * of their kind exists.
 */
import { and, eq, inArray } from "drizzle-orm";

import { fixtures, habits, users } from "../schema";
import type { Db } from "../client";

const PROFILE = {
  usualWakeTime: "07:00",
  workStartTime: "09:00",
  workEndTime: "17:30",
  lightsOutTime: "22:45",
  devicesOffTime: "22:15",
  earliestWakeTime: "06:30",
  scheduleShape: "own_structure_dynamic" as const,
  anchorDirection: "routine_cut" as const,
  overflowMode: "daily_menu" as const,
  workDays: {
    "0": "always" as const,
    "1": "always" as const,
    "2": "always" as const,
    "3": "always" as const,
    "4": "always" as const,
    "5": "sometimes" as const,
    "6": "never" as const,
  },
};

type RotationSeed = {
  title: string;
  type: "workout" | "deep_work";
  weeklyTarget: number;
  typicalDays: number[];
  durationMin: number | null;
};

const ROTATION: RotationSeed[] = [
  { title: "Push", type: "workout", weeklyTarget: 2, typicalDays: [0, 3], durationMin: 60 },
  { title: "Pull", type: "workout", weeklyTarget: 1, typicalDays: [1], durationMin: 60 },
  { title: "Legs", type: "workout", weeklyTarget: 1, typicalDays: [2], durationMin: 60 },
  { title: "Viewpoint", type: "deep_work", weeklyTarget: 2, typicalDays: [0, 3], durationMin: null },
  { title: "Conscious Connections", type: "deep_work", weeklyTarget: 1, typicalDays: [1], durationMin: null },
  { title: "Applications", type: "deep_work", weeklyTarget: 1, typicalDays: [2], durationMin: null },
  { title: "Krishan", type: "deep_work", weeklyTarget: 1, typicalDays: [4], durationMin: null },
];

export async function seedProfile(db: Db, userId: string): Promise<{ profile: number }> {
  const [row] = await db
    .select({ workStartTime: users.workStartTime })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row || row.workStartTime !== null) return { profile: 0 };

  await db.update(users).set(PROFILE).where(eq(users.id, userId));
  return { profile: 1 };
}

export async function seedRotation(
  db: Db,
  userId: string,
): Promise<{ workouts: number; focuses: number }> {
  const existing = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.userId, userId), inArray(habits.type, ["workout", "deep_work"])))
    .limit(1);
  if (existing.length > 0) return { workouts: 0, focuses: 0 };

  const inserted = await db
    .insert(habits)
    .values(
      ROTATION.map((entry) => ({
        blockKind: entry.type === "workout" ? ("training" as const) : ("work" as const),
        durationMaxMin: entry.durationMin,
        durationMinMin: entry.durationMin,
        lifePriority: 6,
        title: entry.title,
        type: entry.type,
        typicalDays: entry.typicalDays,
        userId,
        weeklyTarget: entry.weeklyTarget,
      })),
    )
    .returning({ type: habits.type });

  return {
    workouts: inserted.filter((row) => row.type === "workout").length,
    focuses: inserted.filter((row) => row.type === "deep_work").length,
  };
}

export async function seedFixture(db: Db, userId: string): Promise<{ fixtures: number }> {
  const existing = await db
    .select({ id: fixtures.id })
    .from(fixtures)
    .where(eq(fixtures.userId, userId))
    .limit(1);
  if (existing.length > 0) return { fixtures: 0 };

  const inserted = await db
    .insert(fixtures)
    .values({
      atTime: "09:30",
      blockKind: "work",
      durationMin: 20,
      scheduling: "hard",
      title: "Stand-up",
      userId,
      weekdays: [1],
    })
    .returning({ id: fixtures.id });

  return { fixtures: inserted.length };
}
