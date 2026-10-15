"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import { AddIcon, Button, useIsSplit } from "@syn/ui";
import { useAccount } from "@/lib/data/use-account";
import { AddMenu } from "./add-menu";
import { AddSheet } from "./add-sheet";
import type { AddChoice } from "./choices";
import { ADD_COPY as COPY } from "./copy";
import { blockLine } from "./new-task/form";
import { NewTaskSheet } from "./new-task/new-task-sheet";

/**
 * AddEntry — + Add at either width (USE-51; add/index.md): below the desk a
 * + named "Add" opens the Add sheet (D-USE-51); at it "+ Add ⌄" opens the
 * menu (D-USE-42). Both offer the same four in the same order; Task to a
 * tier opens New task here, the other three are their tickets' and come in
 * as callbacks. Now's and Today's headers mount it (their tickets).
 */
export interface AddEntryProps {
  dateKey: string;
  /** The block under way or named, for the sheet's line and New task's day. */
  block: { id: string; name: string; startsAt: string; endsAt: string } | null;
  tier?: WorkTier;
  onFromPool?: () => void;
  onTodo?: () => void;
  onEvent?: () => void;
  /** For a capture: the sheet, the menu or New task open on load. */
  openOnLoad?: "add" | "new-task";
  /** New task's starting draft, for its capture. */
  initialTask?: React.ComponentProps<typeof NewTaskSheet>["initial"];
}

export function AddEntry({
  dateKey,
  block,
  tier,
  onFromPool,
  onTodo,
  onEvent,
  openOnLoad,
  initialTask,
}: AddEntryProps) {
  const atDesk = useIsSplit();
  const personName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [sheetOpen, setSheetOpen] = React.useState(openOnLoad === "add");
  const [taskOpen, setTaskOpen] = React.useState(openOnLoad === "new-task");

  function choose(choice: AddChoice) {
    setSheetOpen(false);
    if (choice === "task") setTaskOpen(true);
    if (choice === "pool") onFromPool?.();
    if (choice === "todo") onTodo?.();
    if (choice === "event") onEvent?.();
  }

  return (
    <>
      {atDesk ? (
        <AddMenu
          personName={personName}
          onChoose={choose}
          defaultOpen={openOnLoad === "add"}
          triggerRef={triggerRef}
        />
      ) : (
        <>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            aria-label={COPY.trigger}
            onClick={() => setSheetOpen(true)}
          >
            <AddIcon aria-hidden="true" />
          </Button>
          <AddSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            blockLine={blockLine(dateKey, block)}
            personName={personName}
            onChoose={choose}
            returnFocusRef={triggerRef}
          />
        </>
      )}
      <NewTaskSheet
        open={taskOpen}
        onOpenChange={setTaskOpen}
        dateKey={dateKey}
        blockId={block?.id}
        tier={tier}
        from="add"
        initial={initialTask}
        returnFocusRef={triggerRef}
      />
    </>
  );
}
