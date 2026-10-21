import { daysBlockRoute } from "@/lib/routes";
import type { NewBlockForm } from "./form";

/**
 * Where Add block lands (USE-147; new-block-sheet states/wellness.md,
 * C-USE-new-block-sheet-wellness-2): the new block's Block view, on the
 * usual weekday or on the date it was added from, where an empty block opens
 * with its add row focused. A transition has no Block view of its own, so
 * it returns null and the sheet closes to the column.
 */
export function addedRoute(
  id: string,
  form: Pick<NewBlockForm, "mode">,
  scope: { weekday: number; date: string | null },
): string | null {
  if (form.mode === "transition" || id === "") return null;
  return daysBlockRoute(
    id,
    scope.date === null ? { weekday: scope.weekday } : { date: scope.date },
  );
}
