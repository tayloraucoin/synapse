import { eq } from "drizzle-orm";

import { STARTER_HABITS } from "@syn/constants";
import { habits, users, type RlsClient } from "@syn/db";
import type { IconValue } from "@syn/types";

/**
 * "Start from a small set" — Epic 1 FR-02's ten example habits, created as
 * real library entries.
 *
 * THE CLIENT SENDS TITLES, NOT ROWS. The chooser offers what
 * `STARTER_HABITS` contains, so the server looks each title up in that same
 * constant and writes the values IT holds — a client cannot use this to create
 * a habit with an importance of 9 or a 600-minute range by editing a payload.
 * The set is data, not input.
 *
 * The wake-anchor mark on the first starter applies ONLY when the person has
 * no anchor yet. Someone adding the starter set to an existing library has
 * already made that choice, and this is not the moment to overrule it.
 */

const DEFAULT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

export async function createFromStarterSet(
  rls: RlsClient,
  userId: string,
  titles: readonly string[],
): Promise<{ created: number }> {
  const wanted = new Set(titles);
  const chosen = STARTER_HABITS.filter((habit) => wanted.has(habit.title));

  if (chosen.length === 0) return { created: 0 };

  return rls.execute(async (tx) => {
    const inserted = await tx
      .insert(habits)
      .values(
        chosen.map((habit) => ({
          userId,
          title: habit.title,
          type: "habit" as const,
          icon: DEFAULT_ICON,
          durationMinMin: habit.rangeMin,
          durationMaxMin: habit.rangeMax,
          lifePriority: habit.importance,
          reflectionAxes: [],
        })),
      )
      .returning({ id: habits.id, title: habits.title });

    const anchorTitle = chosen.find((habit) => habit.wakeAnchor)?.title;
    if (anchorTitle !== undefined) {
      const [account] = await tx
        .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (account && account.wakeAnchorHabitId === null) {
        const anchor = inserted.find((row) => row.title === anchorTitle);
        if (anchor) {
          await tx
            .update(users)
            .set({ wakeAnchorHabitId: anchor.id, updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
      }
    }

    return { created: inserted.length };
  });
}
