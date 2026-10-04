"use client";

import { MoreVertical } from "lucide-react";
import * as React from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@syn/ui";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { MENU_TRIGGER } from "./task-menu";

/**
 * The lane menu (UX WF-01, §3.5): *First today* or *Back to usual order* ·
 * *Rename* · *Colour* · *Move up* · *Move down* · *Archive group*.
 *
 * *Move up* / *Move down* reorder the usual order among unpinned lanes; on a
 * pinned lane both are disabled — pinned lanes hold their place (§3.5).
 */
export function LaneMenu({
  name,
  pinned,
  canMoveUp,
  canMoveDown,
  disabled,
  onFirstToday,
  onRename,
  onColour,
  onMoveUp,
  onMoveDown,
  onArchive,
}: {
  name: string;
  pinned: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  onFirstToday: (pinned: boolean) => void;
  onRename: () => void;
  onColour: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onArchive: () => void;
}) {
  // *Rename* and *Colour* hand focus to a field or a popover; the menu must not
  // pull it back to its trigger as it closes, or the popover reads that as
  // focus leaving it and shuts at once.
  const focusElsewhere = React.useRef(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={COPY.laneOptions(name)} disabled={disabled} className={MENU_TRIGGER}>
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
        <DropdownMenuItem onSelect={() => onFirstToday(!pinned)}>
          {pinned ? COPY.backToUsualOrder : COPY.firstToday}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            focusElsewhere.current = true;
            onRename();
          }}
        >
          {COPY.rename}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            focusElsewhere.current = true;
            onColour();
          }}
        >
          {COPY.colour}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={pinned || !canMoveUp} onSelect={onMoveUp}>
          {COPY.moveUp}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={pinned || !canMoveDown} onSelect={onMoveDown}>
          {COPY.moveDown}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchive}>{COPY.archiveGroup}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
