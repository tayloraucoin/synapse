import { STARTER_LIBRARY, type BlockKindValue } from "@syn/constants";
import { habits, type RlsClient } from "@syn/db";

/**
 * The per-block starter library — UX v1.1 §4.7, §4.8, §12.4 — created as real
 * library entries in the block the person was looking at.
 *
 * THE CLIENT SENDS TITLES, NOT ROWS. The chooser offers what
 * `STARTER_LIBRARY[blockKind]` contains; the server looks each title up in
 * that same constant and writes the values IT holds — since UX v1.2 (R29,
 * RUN-3) including the row's glyph as `icon`, so *Breakfast* arrives as 🍳
 * without the person choosing it and may be changed afterwards. A title not
 * in the library is ignored, not invented.
 *
 * `placed` rows (the journal, *Phone away*) are never created here: the app
 * places them from the profile (v1.1 §7.1), and a chooser that could make a
 * second *Phone away* would make the pin ambiguous.
 *
 * Nothing pre-checked, ever — that is the chooser's rule, and this service
 * only ever sees what was ticked. The rows it returns carry the ids so a
 * chooser can key its tick by the row from the first response (S7.5).
 */

export async function createFromStarterLibrary(
  rls: RlsClient,
  userId: string,
  input: { blockKind: BlockKindValue; titles: readonly string[] },
): Promise<{ created: number; rows: Array<{ id: string; title: string }> }> {
  const wanted = new Set(input.titles);
  const chosen = STARTER_LIBRARY[input.blockKind].filter(
    (entry) => wanted.has(entry.title) && entry.placed !== true,
  );

  if (chosen.length === 0) return { created: 0, rows: [] };

  return rls.execute(async (tx) => {
    const inserted = await tx
      .insert(habits)
      .values(
        chosen.map((entry) => ({
          userId,
          title: entry.title,
          type: "habit" as const,
          icon: entry.icon,
          blockKind: input.blockKind,
          durationMinMin: entry.rangeMin,
          durationMaxMin: entry.rangeMax,
          lifePriority: entry.importance,
          reflectionAxes: [],
        })),
      )
      .returning({ id: habits.id, title: habits.title });

    return { created: inserted.length, rows: inserted };
  });
}
