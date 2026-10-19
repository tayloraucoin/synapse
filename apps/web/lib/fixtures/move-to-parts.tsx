"use client";

import * as React from "react";
import { toastUndo } from "@syn/ui";
import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";
import { MoveToSheet } from "@/components/planner/move-to";
import { targetWords } from "@/components/planner/move-to/target-words";
import { useMoveTo } from "@/lib/data/use-move-to";
import { MOVE_TO_IDS } from "./scenarios/move-to";

/**
 * USE-69's states on `/dev/parts?state=move-<state>`. The Item sheet's
 * (plain, pick-a-day, no-kind, linear) are Now with `&sheet=item&id=`, as
 * USE-64's; `move-work` is Now at 9:40 with the work menu's Move to sheet
 * over it; `move-undo` makes the first Later today move on load, so the row
 * has left and the toast shows with Undo.
 */
export type MoveToPartState = "sheet" | "work" | "undo";

function MovedOnLoad() {
  const moveTo = useMoveTo(MOVE_TO_IDS.work);
  const done = React.useRef(false);
  const { view } = moveTo;
  React.useEffect(() => {
    const target = view?.later[0];
    if (done.current || view === null || target === undefined) return;
    done.current = true;
    const { toast } = targetWords(target, view.subject, moveTo.todayKey);
    void moveTo.move(target).then((written) => {
      if (written === null) return;
      toastUndo({ text: toast, onUndo: () => void moveTo.undo(written) });
    });
  }, [view, moveTo]);
  return null;
}

export function MoveToPart({ state }: { state: MoveToPartState }) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <NowScreen />
      {state === "work" ? (
        <MoveToSheet
          itemRef={open ? MOVE_TO_IDS.work : null}
          onClose={() => setOpen(false)}
        />
      ) : state === "undo" ? (
        <MovedOnLoad />
      ) : null}
    </>
  );
}
