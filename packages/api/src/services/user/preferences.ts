import { eq } from "drizzle-orm";

import { DEVICES_OFF_OFFSET_MIN, JOURNAL_REMINDER_OFFSET_MIN } from "@syn/constants";
import { users, type RlsClient } from "@syn/db";
import type {
  AnchorDirection,
  BlockKind,
  JournalPrompt,
  MorningMode,
  OverflowMode,
  ScheduleShape,
  WorkDays,
} from "@syn/types";
import type { UpdatePreferencesInput } from "@syn/validators";
import { addDays, clockToMinutes, resolveDayKey } from "@syn/utils";

/**
 * The one home for "change my account preferences".
 *
 * It is a service rather than a resolver body because it is already
 * multi-step — build the patch, write, read back — and because the same
 * operation will be reachable from more than one rail: the settings mutation
 * today, and the first-run sequence writing a timezone tomorrow. A rule
 * implemented in two seams is a rule that will diverge in one of them.
 */

export type UserPreferencesRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  timezone: string;
  dayCloseTime: string;
  reviewReminderTime: string;
  /** FR-01 / ST-08. The default `anchor_time` for a new template (SET-5). */
  usualWakeTime: string;
  theme: "system" | "light" | "dark";
  firstRunStep: number | null;
  firstRunCompletedAt: Date | null;
  /**
   * The deferred half of ST-08 (cross-cutting §7.3, §7.5). Non-null means the
   * person has changed the value and it takes effect on `…From`; the screen
   * shows the pending value with *Applies from tomorrow.*, because showing the
   * old one would look like the save failed.
   */
  pendingDayCloseTime: string | null;
  pendingDayCloseTimeFrom: string | null;
  pendingTimezone: string | null;
  pendingTimezoneFrom: string | null;
  /** ST-07's N6 value, and the one server fact about the reminder ask. */
  weekBuildReminderWeekday: number;
  weekBuildReminderTime: string;
  reminderPromptAnsweredAt: Date | null;

  /*
   * ---- UX v1.1 §11.2 — the profile the block model lays days out from.
   */
  scheduleShape: ScheduleShape | null;
  workDays: WorkDays | null;
  workStartTime: string | null;
  workEndTime: string | null;
  anchorDirection: AnchorDirection | null;
  earliestWakeTime: string | null;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  overflowMode: OverflowMode;
  orientPassage: string | null;
  orientShowLastNight: boolean;
  orientAskGratitude: boolean;
  journalEnabled: boolean;
  journalPrompts: JournalPrompt[];
  blockOrder: BlockKind[];

  /*
   * ---- UX v1.2 §11.1 (RUN-3). The three v1.1 columns above that v1.2 stops
   * writing (`earliestWakeTime`, `orientPassage`, `orientShowLastNight`) are
   * still READ here until `0008` drops them; nothing writes them.
   */
  morningMode: MorningMode;
  quotesOptIn: boolean;
  orientAskIntention: boolean;
  orientAskVisualisation: boolean;
  journalReminderEnabled: boolean;
  /** The stored value; null = derived. See `journalReminderTimeEffective`. */
  journalReminderTime: string | null;
  /** UX v1.3 R61 (0009) — *Same routine every day?*; null = not yet asked. */
  sameMorningRoutine: boolean | null;
  /**
   * The two derived defaults (v1.2 §4.11, §13 #25), computed on read so a
   * person who never touched them always tracks the value they follow:
   * phone away = lights out − 60 while `devicesOffTime` is null; the
   * reminder = phone away − 60 while `journalReminderTime` is null. Null only
   * when the thing followed is itself unset.
   */
  devicesOffTimeEffective: string | null;
  journalReminderTimeEffective: string | null;
};

const PREFERENCE_COLUMNS = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  timezone: users.timezone,
  dayCloseTime: users.dayCloseTime,
  reviewReminderTime: users.reviewReminderTime,
  usualWakeTime: users.usualWakeTime,
  theme: users.theme,
  firstRunStep: users.firstRunStep,
  firstRunCompletedAt: users.firstRunCompletedAt,
  pendingDayCloseTime: users.pendingDayCloseTime,
  pendingDayCloseTimeFrom: users.pendingDayCloseTimeFrom,
  pendingTimezone: users.pendingTimezone,
  pendingTimezoneFrom: users.pendingTimezoneFrom,
  weekBuildReminderWeekday: users.weekBuildReminderWeekday,
  weekBuildReminderTime: users.weekBuildReminderTime,
  reminderPromptAnsweredAt: users.reminderPromptAnsweredAt,
  scheduleShape: users.scheduleShape,
  workDays: users.workDays,
  workStartTime: users.workStartTime,
  workEndTime: users.workEndTime,
  anchorDirection: users.anchorDirection,
  earliestWakeTime: users.earliestWakeTime,
  lightsOutTime: users.lightsOutTime,
  devicesOffTime: users.devicesOffTime,
  overflowMode: users.overflowMode,
  orientPassage: users.orientPassage,
  orientShowLastNight: users.orientShowLastNight,
  orientAskGratitude: users.orientAskGratitude,
  journalEnabled: users.journalEnabled,
  journalPrompts: users.journalPrompts,
  blockOrder: users.blockOrder,
  morningMode: users.morningMode,
  quotesOptIn: users.quotesOptIn,
  orientAskIntention: users.orientAskIntention,
  orientAskVisualisation: users.orientAskVisualisation,
  journalReminderEnabled: users.journalReminderEnabled,
  journalReminderTime: users.journalReminderTime,
  sameMorningRoutine: users.sameMorningRoutine,
} as const;

type StoredPreferencesRow = Omit<
  UserPreferencesRow,
  "devicesOffTimeEffective" | "journalReminderTimeEffective"
>;

/** `"HH:mm"` minus `offsetMin`, wrapping past midnight; null when there is nothing to follow. */
function minusMinutes(clock: string | null, offsetMin: number): string | null {
  if (clock === null) return null;
  const total = ((clockToMinutes(clock.slice(0, 5)) - offsetMin) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * The two derived evening times — one function, so `preferences.ts` and the
 * reminder scan (RUN-6) cannot disagree about what "an hour before" means.
 */
export function effectiveEveningTimes(row: {
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  journalReminderTime: string | null;
}): { devicesOffTimeEffective: string | null; journalReminderTimeEffective: string | null } {
  const devicesOffTimeEffective =
    row.devicesOffTime ?? minusMinutes(row.lightsOutTime, DEVICES_OFF_OFFSET_MIN);
  const journalReminderTimeEffective =
    row.journalReminderTime ??
    minusMinutes(devicesOffTimeEffective, JOURNAL_REMINDER_OFFSET_MIN);
  return { devicesOffTimeEffective, journalReminderTimeEffective };
}

function withEffective(row: StoredPreferencesRow): UserPreferencesRow {
  return { ...row, ...effectiveEveningTimes(row) };
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/** The same read inside a caller's transaction (the week build, RUN-5). */
export async function readPreferencesInTx(
  tx: Tx,
  userId: string,
): Promise<UserPreferencesRow | null> {
  const rows = await tx
    .select(PREFERENCE_COLUMNS)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const row = rows[0];
  return row ? withEffective(row) : null;
}

/** The caller's own row, or null. RLS makes "own" the only reachable answer. */
export async function readPreferences(
  rls: RlsClient,
  userId: string,
): Promise<UserPreferencesRow | null> {
  return rls.execute((tx) => readPreferencesInTx(tx, userId));
}

/**
 * Writes the given subset and returns the updated row.
 *
 * Returning the row rather than `{ ok: true }` is deliberate: the client cache
 * updates from the response in one round trip instead of a write followed by a
 * refetch, and the caller sees exactly what was stored rather than what it
 * hoped was stored.
 *
 * The `where` clause is belt and braces — RLS already restricts the update to
 * the caller's row — but a mutation with no `where` is one refactor away from
 * being a mutation over the table, and the policy should not be the only thing
 * standing between here and that.
 */
export async function updatePreferences(
  rls: RlsClient,
  userId: string,
  input: UpdatePreferencesInput,
  /** Injectable for a fixed clock; the resolver never passes one. */
  now: Date = new Date(),
): Promise<UserPreferencesRow | null> {
  const patch = {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
    ...(input.dayCloseTime !== undefined
      ? { dayCloseTime: input.dayCloseTime }
      : {}),
    ...(input.reviewReminderTime !== undefined
      ? { reviewReminderTime: input.reviewReminderTime }
      : {}),
    ...(input.theme !== undefined ? { theme: input.theme } : {}),
    ...(input.usualWakeTime !== undefined
      ? { usualWakeTime: input.usualWakeTime }
      : {}),
    // `null` is a real value here — it is how the sequence records "no step
    // owed" — so the guard is against `undefined` alone, as everywhere above.
    ...(input.firstRunStep !== undefined
      ? { firstRunStep: input.firstRunStep }
      : {}),
    ...(input.weekBuildReminderWeekday !== undefined
      ? { weekBuildReminderWeekday: input.weekBuildReminderWeekday }
      : {}),
    ...(input.weekBuildReminderTime !== undefined
      ? { weekBuildReminderTime: input.weekBuildReminderTime }
      : {}),
    ...(input.reminderPromptAnsweredAt !== undefined
      ? { reminderPromptAnsweredAt: input.reminderPromptAnsweredAt }
      : {}),
    // UX v1.1 §11.2. `null` is a real value on the nullable ones (a person
    // clearing their lights-out time), so the guard is against `undefined`.
    ...(input.scheduleShape !== undefined
      ? { scheduleShape: input.scheduleShape }
      : {}),
    ...(input.workDays !== undefined ? { workDays: input.workDays } : {}),
    ...(input.workStartTime !== undefined
      ? { workStartTime: input.workStartTime }
      : {}),
    ...(input.workEndTime !== undefined ? { workEndTime: input.workEndTime } : {}),
    ...(input.anchorDirection !== undefined
      ? { anchorDirection: input.anchorDirection }
      : {}),
    // `earliestWakeTime`, `orientPassage`, `orientShowLastNight` are NOT
    // written since UX v1.2 (R39, R36, R41; RUN-3): the keys stay accepted
    // and ignored until RUN-8/RUN-9 remove their senders, and `0008` drops
    // the columns.
    ...(input.lightsOutTime !== undefined
      ? { lightsOutTime: input.lightsOutTime }
      : {}),
    ...(input.devicesOffTime !== undefined
      ? { devicesOffTime: input.devicesOffTime }
      : {}),
    ...(input.overflowMode !== undefined
      ? { overflowMode: input.overflowMode }
      : {}),
    ...(input.orientAskGratitude !== undefined
      ? { orientAskGratitude: input.orientAskGratitude }
      : {}),
    ...(input.journalEnabled !== undefined
      ? { journalEnabled: input.journalEnabled }
      : {}),
    ...(input.journalPrompts !== undefined
      ? { journalPrompts: input.journalPrompts }
      : {}),
    ...(input.blockOrder !== undefined ? { blockOrder: input.blockOrder } : {}),
    // UX v1.2 §11.1. Each alone (save as you go, §2 guardrail 5).
    ...(input.morningMode !== undefined ? { morningMode: input.morningMode } : {}),
    ...(input.quotesOptIn !== undefined ? { quotesOptIn: input.quotesOptIn } : {}),
    ...(input.orientAskIntention !== undefined
      ? { orientAskIntention: input.orientAskIntention }
      : {}),
    ...(input.orientAskVisualisation !== undefined
      ? { orientAskVisualisation: input.orientAskVisualisation }
      : {}),
    ...(input.journalReminderEnabled !== undefined
      ? { journalReminderEnabled: input.journalReminderEnabled }
      : {}),
    ...(input.journalReminderTime !== undefined
      ? { journalReminderTime: input.journalReminderTime }
      : {}),
    // UX v1.3 R61 (DAY-5). `null` is a real value — not yet asked — so the guard is `undefined`.
    ...(input.sameMorningRoutine !== undefined
      ? { sameMorningRoutine: input.sameMorningRoutine }
      : {}),
    updatedAt: new Date(),
  };

  const deferring =
    input.pendingDayCloseTime !== undefined ||
    input.pendingTimezone !== undefined;

  /**
   * The date a deferred change starts applying: the day after the one the
   * person is currently in.
   *
   * IT IS COMPUTED FROM THEIR CURRENT ZONE AND CLOSE TIME, not the new ones.
   * "Has tomorrow arrived" has to be answered in the day they are still living
   * in — the same reason `resolveTodayFor` compares with the old values before
   * promoting. Computing it with the new zone would let a westward move set a
   * boundary that has already passed, applying the change immediately, which
   * is the one thing the pending pair exists to prevent.
   *
   * It is computed on the SERVER and never accepted from the client, so no
   * request can ask for a change that applies retroactively.
   */
  const pendingPatch = deferring
    ? await rls.execute(async (tx) => {
        const [current] = await tx
          .select({
            timezone: users.timezone,
            dayCloseTime: users.dayCloseTime,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!current) return {};

        const from = addDays(
          resolveDayKey(now, current.timezone, current.dayCloseTime),
          1,
        );

        return {
          ...(input.pendingDayCloseTime !== undefined
            ? {
                pendingDayCloseTime: input.pendingDayCloseTime,
                pendingDayCloseTimeFrom: from,
              }
            : {}),
          ...(input.pendingTimezone !== undefined
            ? {
                pendingTimezone: input.pendingTimezone,
                pendingTimezoneFrom: from,
              }
            : {}),
        };
      })
    : {};

  const rows = await rls.execute((tx) =>
    tx
      .update(users)
      .set({ ...patch, ...pendingPatch })
      .where(eq(users.id, userId))
      .returning(PREFERENCE_COLUMNS),
  );

  const row = rows[0];
  return row ? withEffective(row) : null;
}
