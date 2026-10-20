"use client";

/**
 * RowMenu — a Morning reading row's ··· (USE-152; row-menu.md, D-USE-123,
 * D-USE-124). Props only.
 *
 * "Edit", "Move up", "Move down", a rule, then "Turn off" over its muted
 * line "Leaves Orient, kept under Off". The first row has no Move up and the
 * last no Move down; Move up and Move down are the keyboard path to the
 * order, so a drag is never the only way. Edit shows once USE-153 passes its
 * opener. `EllipsesMenu` takes one line per item, so the menu is built from
 * its `DropdownMenu` parts with the same trigger. Offline it waits, faint
 * (D-USE-129).
 */
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MoreIcon,
  Text,
} from "@syn/ui";
import { MORNING_READING_COPY as COPY } from "./copy";

export interface RowMenuProps {
  id: string;
  /** The row's name, for the trigger: "More for <title>". */
  name: string;
  first: boolean;
  last: boolean;
  waiting: boolean;
  /** Open on load, for the `row-menu` capture. */
  defaultOpen?: boolean;
  /** USE-153's sheet; unset, Edit is hidden. */
  onEdit?: () => void;
  onMove: (direction: -1 | 1) => void;
  onTurnOff: () => void;
}

const TRIGGER = cn(
  "inline-flex size-(--target) shrink-0 items-center justify-center",
  "rounded-(--radius) text-text-secondary outline-none",
  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  "hover:text-ink",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-40",
);

export function RowMenu({
  id,
  name,
  first,
  last,
  waiting,
  defaultOpen = false,
  onEdit,
  onMove,
  onTurnOff,
}: RowMenuProps) {
  const moves = [
    first ? null : { label: COPY.moveUp, direction: -1 as const },
    last ? null : { label: COPY.moveDown, direction: 1 as const },
  ].filter((move) => move !== null);

  return (
    <DropdownMenu defaultOpen={defaultOpen && !waiting} modal={false}>
      <DropdownMenuTrigger
        disabled={waiting}
        aria-label={COPY.more(name)}
        data-reading-more={id}
        className={TRIGGER}
      >
        <MoreIcon aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit ? (
          <DropdownMenuItem onSelect={onEdit}>{COPY.edit}</DropdownMenuItem>
        ) : null}
        {moves.map((move) => (
          <DropdownMenuItem
            key={move.label}
            onSelect={() => onMove(move.direction)}
          >
            {move.label}
          </DropdownMenuItem>
        ))}
        {onEdit || moves.length > 0 ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem
          onSelect={onTurnOff}
          className="flex-col items-start gap-0 py-(--space-2)"
        >
          <span>{COPY.turnOff}</span>
          <Text as="span" variant="caption" tone="muted">
            {COPY.turnOffLine}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
