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
  /* ---- UX v1.2 §3.6, R42 (0007) ---- */
  kind: FixtureView["kind"];
  icon: FixtureView["icon"];
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
    kind: row.kind,
    icon: row.icon,
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
  kind: fixtures.kind,
  icon: fixtures.icon,
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
  // UX v1.2 §3.6, R42: the kind's glyph and block unless the sheet sent its
  // own. A kind is a label — the block it implies is a default the person
  // overrides, and nothing in materialisation reads the kind.
  const defaults = fixtureKindDefaults(input.kind);
  const values = {
    title: input.title,
    weekdays: [...new Set(input.weekdays)].sort((a, b) => a - b),
    atTime: input.atClock,
    durationMin: input.durationMin,
    blockKind: input.blockKind ?? defaults.defaultBlockKind,
    scheduling: input.scheduling,
    habitId: input.habitId ?? null,
    kind: input.kind,
    icon: input.icon ?? defaults.icon,
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
