import { and, asc, eq, isNull } from "drizzle-orm";

import { fixtureKindDefaults } from "@syn/constants";
import { fixtures, type RlsClient } from "@syn/db";
import type { FixtureView, Weekday } from "@syn/types";
import type { FixtureFormInput } from "@syn/validators";
import { formatClockFromMinutes, clockToMinutes } from "@syn/utils";

/**
 * Fixtures — things that happen every week on set days at a set time (UX v1.1
 * §3.6, §4.4, §11.6, TD-8). Plain owner-private CRUD; the interesting part is
 * where they LAND, which is the materialiser's (DYN-5): a pinned `day_items`
 * row on every planned instance of their weekdays, whatever template the day
 * gets.
 *
 * ARCHIVE, NEVER DELETE — a past day's pin snapshots the title, and a fixture
 * that vanished would leave that pin pointing at nothing it could explain.
 */

type FixtureRow = {
  id: string;
  title: string;
  weekdays: number[];
  atTime: string;
  durationMin: number;
  blockKind: FixtureView["blockKind"];
  scheduling: FixtureView["scheduling"];
  habitId: string | null;
  archivedAt: Date | null;
};

export function toFixtureView(row: FixtureRow): FixtureView {
  return {
    id: row.id,
    title: row.title,
    weekdays: [...row.weekdays].sort((a, b) => a - b) as Weekday[],
    atClock: formatClockFromMinutes(clockToMinutes(row.atTime.slice(0, 5))),
    durationMin: row.durationMin,
    blockKind: row.blockKind,
    scheduling: row.scheduling,
    habitId: row.habitId,
    archived: row.archivedAt !== null,
    // UX v1.2 (RUN-1): the *Other* kind's defaults until RUN-3 reads `0007`'s columns.
    kind: "other",
    icon: fixtureKindDefaults("other").icon,
  };
}

const COLUMNS = {
  id: fixtures.id,
  title: fixtures.title,
  weekdays: fixtures.weekdays,
  atTime: fixtures.atTime,
  durationMin: fixtures.durationMin,
  blockKind: fixtures.blockKind,
  scheduling: fixtures.scheduling,
  habitId: fixtures.habitId,
  archivedAt: fixtures.archivedAt,
} as const;

export async function listFixtures(
  rls: RlsClient,
  userId: string,
  options: { includeArchived?: boolean } = {},
): Promise<FixtureView[]> {
  const rows = await rls.execute((tx) =>
    tx
      .select(COLUMNS)
      .from(fixtures)
      .where(
        options.includeArchived
          ? eq(fixtures.userId, userId)
          : and(eq(fixtures.userId, userId), isNull(fixtures.archivedAt)),
      )
      .orderBy(asc(fixtures.atTime), asc(fixtures.title)),
  );
  return rows.map(toFixtureView);
}

export async function saveFixture(
  rls: RlsClient,
  userId: string,
  input: FixtureFormInput,
): Promise<FixtureView | null> {
  const values = {
    title: input.title,
    weekdays: [...new Set(input.weekdays)].sort((a, b) => a - b),
    atTime: input.atClock,
    durationMin: input.durationMin,
    blockKind: input.blockKind,
    scheduling: input.scheduling,
    habitId: input.habitId ?? null,
  };

  const rows = await rls.execute((tx) =>
    input.id
      ? tx
          .update(fixtures)
          .set({ ...values, updatedAt: new Date() })
          .where(and(eq(fixtures.id, input.id), eq(fixtures.userId, userId)))
          .returning(COLUMNS)
      : tx
          .insert(fixtures)
          .values({ ...values, userId })
          .returning(COLUMNS),
  );

  const row = rows[0];
  return row ? toFixtureView(row) : null;
}

export async function archiveFixture(
  rls: RlsClient,
  userId: string,
  id: string,
  archived: boolean,
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .update(fixtures)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(fixtures.id, id), eq(fixtures.userId, userId)))
      .returning({ id: fixtures.id }),
  );
  return rows.length > 0;
}
