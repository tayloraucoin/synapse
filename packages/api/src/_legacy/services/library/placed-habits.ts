import { and, eq } from "drizzle-orm";

import { STARTER_LIBRARY } from "@syn/constants";
import { habits, type RlsClient } from "@syn/db";
import type { IconValue } from "@syn/types";

/**
 * The habits the app places for the person — UX v1.1 §7.1, §12.4 (`placed`).
 *
 * *Phone away* is the devices-off marker: a pin at `users.devices_off_time`
 * in the wind-down block, a hairline row with the anchor glyph and no
 * checkbox. It is a `day_items` row because the Schedule, the pushes and the
 * *confirm in the morning* rule all read rows; it needs a habit because a
 * template-origin item's `habit_id` is what the library's usage and the
 * export join on. The habit is created once per person, on first need —
 * first run (DYN-10) or the first wind-down block materialised (DYN-5) —
 * and the read model recognises the marker by this habit, not by its title.
 *
 * [PROVISIONAL — Mason, DYN-5. A `marker` column on `day_items` is the
 * cleaner home; deferred to avoid a fourth migration. Revisit in DYN-21.]
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const PLACED_ICON: IconValue = { kind: "curated", value: "dot", colorKey: null };

const PHONE_AWAY = STARTER_LIBRARY.wind_down.find(
  (entry) => entry.placed === true && entry.title === "Phone away",
);

export const PHONE_AWAY_TITLE = PHONE_AWAY?.title ?? "Phone away";

/** The person's *Phone away* habit id, created if it does not exist yet. */
export async function ensurePhoneAwayHabit(
  tx: Tx,
  userId: string,
): Promise<string> {
  const [existing] = await tx
    .select({ id: habits.id })
    .from(habits)
    .where(
      and(
        eq(habits.userId, userId),
        eq(habits.title, PHONE_AWAY_TITLE),
        eq(habits.blockKind, "wind_down"),
        eq(habits.type, "task_appointment"),
      ),
    )
    .orderBy(habits.createdAt)
    .limit(1);

  if (existing) return existing.id;

  const [created] = await tx
    .insert(habits)
    .values({
      userId,
      title: PHONE_AWAY_TITLE,
      type: "task_appointment",
      blockKind: "wind_down",
      icon: PLACED_ICON,
      durationMinMin: PHONE_AWAY?.rangeMin ?? 1,
      durationMaxMin: PHONE_AWAY?.rangeMax ?? 1,
      lifePriority: PHONE_AWAY?.importance ?? 6,
    })
    .returning({ id: habits.id });

  if (!created) throw new Error("placed habit insert returned no row");
  return created.id;
}
