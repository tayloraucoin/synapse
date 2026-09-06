"use client";

import * as React from "react";

import { ThreeOptionDialog } from "@syn/ui";
import { weekdayForDayKey } from "@syn/utils";

import { WEEK_COPY as COPY } from "@/components/week-build/copy";
import { trpc } from "@/lib/trpc/client";

/**
 * TP-04 — after editing a template, what happens to the days already using it.
 *
 * IT LIVES WITH THE EDITOR, NOT THE WEEK. The dialog belongs to leaving TP-02:
 * the editor is what knows a change was made in this session, and the editor's
 * header is what reports *Applied to {n} days.* afterwards.
 *
 * *DON'T APPLY* IS A REAL ANSWER, not a cancel. The template is saved either
 * way; someone editing next month's template should not find this week
 * rewritten underneath them. That is the whole reason this asks.
 *
 * IT DOES NOT OPEN WHEN NO DAY WOULD CHANGE. `appliedDays` counts today and
 * forward, so a template used only in the past asks nothing — there is no
 * question to put, and the past is not re-applied to.
 */
export function ApplyChangesDialog({
  open,
  templateId,
  templateName,
  onDone,
}: {
  open: boolean;
  templateId: string;
  templateName: string;
  /**
   * Called once the person has answered — with the number of days changed, so
   * the caller can show *Applied to {n} days.* `null` means it failed, and the
   * caller shows the error line instead.
   */
  onDone: (applied: number | null) => void;
}) {
  const applied = trpc.week.appliedDays.useQuery({ templateId }, { enabled: open });
  const apply = trpc.week.applyChanges.useMutation();
  const utils = trpc.useUtils();

  const count = applied.data?.count ?? 0;
  const dates = applied.data?.dates ?? [];

  // Nothing planned ahead: there is no question, so there is no dialog.
  React.useEffect(() => {
    if (open && applied.isSuccess && count === 0) onDone(0);
  }, [open, applied.isSuccess, count, onDone]);

  function choose(scope: "all" | "from_tomorrow" | "none"): void {
    if (scope === "none") {
      onDone(0);
      return;
    }
    void apply
      .mutateAsync({ templateId, scope })
      .then(async (result) => {
        await utils.week.get.invalidate();
        await utils.week.dayPreview.invalidate();
        onDone(result.applied);
      })
      .catch(() => onDone(null));
  }

  return (
    <ThreeOptionDialog
      open={open && count > 0}
      onOpenChange={(next) => {
        // Dismissing without choosing is *Don't apply*: the safe answer is the
        // one that changes nothing.
        if (!next) onDone(0);
      }}
      title={COPY.applyTitle}
      body={COPY.applyBody(templateName, count, dayList(dates))}
      busy={apply.isPending}
      options={[
        {
          label: COPY.applyAll,
          emphasis: "default",
          onSelect: () => choose("all"),
        },
        {
          label: COPY.applyFromTomorrow,
          emphasis: "secondary",
          onSelect: () => choose("from_tomorrow"),
        },
        {
          label: COPY.applyNone,
          emphasis: "ghost",
          onSelect: () => choose("none"),
        },
      ]}
    />
  );
}

/**
 * "Monday, Wednesday and Friday" — the days named, not counted twice.
 *
 * Past four it stops naming them: a list of eleven weekdays is not something
 * anyone reads before choosing, and the count above it already said how many.
 */
function dayList(dates: readonly string[]): string {
  const names = dates.map((date) => weekdayForDayKey(date));
  if (names.length > 4) return `${names.slice(0, 4).join(", ")} and more`;
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
