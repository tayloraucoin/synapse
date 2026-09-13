import { STARTER_LIBRARY, type BlockKindValue } from "@syn/constants";
import { habits, type RlsClient } from "@syn/db";
import type { IconValue } from "@syn/types";

/**
 * The per-block starter library — UX v1.1 §4.7, §4.8, §12.4 — created as real
 * library entries in the block the person was looking at.
 *
 * THE CLIENT SENDS TITLES, NOT ROWS. The chooser offers what
 * `STARTER_LIBRARY[blockKind]` contains; the server looks each title up in
 * that same constant and writes the values IT holds. A title not in the
 * library is ignored, not invented.
 *
 * `placed` rows (the journal, *Phone away*) are never created here: the app
 * places them from the profile (v1.1 §7.1), and a chooser that could make a
 * second *Phone away* would make the pin ambiguous.
 *
 * Nothing pre-checked, ever — that is the chooser's rule, and this service
 * only ever sees what was ticked.
 */

const DEFAULT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

export async function createFromStarterLibrary(
  rls: RlsClient,
  userId: string,
  input: { blockKind: BlockKindValue; titles: readonly string[] },
): Promise<{ created: number }> {
  const wanted = new Set(input.titles);
  const chosen = STARTER_LIBRARY[input.blockKind].filter(
    (entry) => wanted.has(entry.title) && entry.placed !== true,
  );

  if (chosen.length === 0) return { created: 0 };

  return rls.execute(async (tx) => {
    const inserted = await tx
      .insert(habits)
      .values(
        chosen.map((entry) => ({
          userId,
          title: entry.title,
          type: "habit" as const,
          icon: DEFAULT_ICON,
          blockKind: input.blockKind,
          durationMinMin: entry.rangeMin,
          durationMaxMin: entry.rangeMax,
          lifePriority: entry.importance,
          reflectionAxes: [],
        })),
      )
      .returning({ id: habits.id });

    return { created: inserted.length };
  });
}
