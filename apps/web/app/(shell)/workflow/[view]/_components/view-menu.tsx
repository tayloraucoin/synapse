"use client";

import { MoreVertical } from "lucide-react";
import * as React from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@syn/ui";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { MENU_TRIGGER } from "./task-menu";

/**
 * *View options* (UX WF-01 header, §7 *View menu*): *Rename* · *Columns* ·
 * *Save as a template* · *Archived* · *Archive this view*. *Archive this view*
 * is disabled on the only view — the control says so by being disabled, not
 * by failing.
 *
 * *Rename* hands focus to the tab's field; the menu must not pull it back to
 * its trigger as it closes (the lane menu's rule).
 */
export function ViewMenu({
  triggerRef,
  isLastView,
  disabled,
  onRename,
  onColumns,
  onSaveTemplate,
  onArchived,
  onArchive,
}: {
  /** The sheets this menu opens return focus here (their opener, the item, is gone). */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  isLastView: boolean;
  disabled: boolean;
  onRename: () => void;
  onColumns: () => void;
  onSaveTemplate: () => void;
  onArchived: () => void;
  onArchive: () => void;
}) {
  const focusElsewhere = React.useRef(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger ref={triggerRef} aria-label={COPY.viewOptions} className={MENU_TRIGGER}>
        <MoreVertical className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onCloseAutoFocus={(event) => {
          if (!focusElsewhere.current) return;
          focusElsewhere.current = false;
          event.preventDefault();
        }}
      >
        <DropdownMenuItem
          disabled={disabled}
          onSelect={() => {
            focusElsewhere.current = true;
            onRename();
          }}
        >
          {COPY.rename}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onColumns}>{COPY.columns}</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onSelect={onSaveTemplate}>
          {COPY.saveAsTemplate}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchived}>{COPY.archivedSheet}</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled || isLastView} onSelect={onArchive}>
          {COPY.archiveThisView}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
