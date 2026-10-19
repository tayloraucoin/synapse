"use client";

import { DeleteIcon, DoneIcon, GiveADayIcon } from "@syn/ui";
import { NowBlockMenu } from "../now-block-menu";
import { TODO_SHEET_COPY as COPY } from "./copy";

/**
 * TodoMoreMenu — the To-do sheet's ··· (USE-29; more-open.md, D-USE-37):
 * right-aligned, headed by the to-do's title; Give it a day…, Mark done, a
 * rule, then Delete to-do with its consequence under it. All in ink: Delete
 * is not red and asks nothing, since Undo in the toast covers it. The same
 * menu as the item sheet's ··· (`NowBlockMenu`), so the two never drift.
 */
export interface TodoMoreMenuProps {
  /** The to-do's title: the trigger's name and the menu's heading. */
  title: string;
  /** Open on load, for `?state=more-open`. */
  defaultOpen?: boolean;
  onGiveADay: () => void;
  onMarkDone: () => void;
  onDelete: () => void;
}

export function TodoMoreMenu({
  title,
  defaultOpen = false,
  onGiveADay,
  onMarkDone,
  onDelete,
}: TodoMoreMenuProps) {
  return (
    <NowBlockMenu
      label={COPY.more(title)}
      title={title}
      defaultOpen={defaultOpen}
      rows={[
        { label: COPY.menu.giveADay, icon: GiveADayIcon, onSelect: onGiveADay },
        { label: COPY.menu.markDone, icon: DoneIcon, onSelect: onMarkDone },
        {
          label: COPY.menu.delete,
          icon: DeleteIcon,
          onSelect: onDelete,
          detail: COPY.menu.deleteDetail,
          separated: true,
        },
      ]}
    />
  );
}
