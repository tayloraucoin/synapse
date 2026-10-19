"use client";

import * as React from "react";
import {
  cn,
  DisclosureIcon,
  DoneIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
} from "@syn/ui";
import { PriorityMarkGlyph } from "@/components/work/priority-chip";
import { PRIORITY_LEVELS, PRIORITY_ORDER } from "@/lib/data/item-sheet-linear";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.linear;

/**
 * PriorityMenu — the Priority row on a linked item and its pull-down
 * (USE-66; linear-priority.md, D-USE-113): "Priority · changes it in
 * Linear", Urgent to Low each its mark with its word, Normal with "Medium in
 * Linear", a rule, No priority (a dashed line). The picked one shaded with a
 * check. A pick writes to Linear; outside closes with nothing changed.
 * Props only.
 */
export interface PriorityMenuProps {
  value: number;
  onChange: (priority: number) => void;
  /** Open on load, for `?state=item-linear-priority`. */
  defaultOpen?: boolean;
}

/** The mark: Linear's bars or square in its colour, or No priority's dash. */
export function PriorityMark({ value }: { value: number }) {
  const level = PRIORITY_LEVELS[value] ?? null;
  const word = COPY.priorities[value] ?? COPY.priorities[0]!;
  if (level === null)
    return (
      <span aria-hidden="true" className="text-muted-foreground inline-flex">
        <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-current">
          <path
            d="M1 6h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  // The word sits beside it, so the mark itself is read as nothing.
  return (
    <span aria-hidden="true" className="inline-flex">
      <PriorityMarkGlyph level={level} word={word} />
    </span>
  );
}

export function PriorityMenu({
  value,
  onChange,
  defaultOpen = false,
}: PriorityMenuProps) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  const word = COPY.priorities[value] ?? COPY.priorities[0]!;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        aria-label={COPY.priorityName(word)}
        className={cn(
          "border-hairline flex min-h-14 w-full items-center gap-(--space-2) border-t text-start outline-none",
          "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2",
        )}
      >
        <Text as="span" variant="body" className="flex-1">
          {COPY.priority}
        </Text>
        <PriorityMark value={value} />
        <Text as="span" variant="body">
          {word}
        </Text>
        <DisclosureIcon
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={4}
        className="bg-background shadow-menu w-56 rounded-(--radius-sheet) p-0 py-(--space-1) motion-reduce:animate-none"
      >
        <DropdownMenuLabel className="text-muted-foreground px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium">
          {COPY.priorityHeading}
        </DropdownMenuLabel>
        {PRIORITY_ORDER.map((priority) => {
          const selected = priority === value;
          return (
            <React.Fragment key={priority}>
              {priority === 0 ? (
                <DropdownMenuSeparator className="mx-(--space-4) my-(--space-1)" />
              ) : null}
              <DropdownMenuItem
                aria-checked={selected}
                role="menuitemradio"
                onSelect={() => {
                  if (!selected) onChange(priority);
                }}
                className={cn(
                  "text-foreground mx-(--space-1) min-h-(--target) gap-(--space-3) px-(--space-3) text-(length:--fs-body)",
                  selected && "bg-surface",
                )}
              >
                <PriorityMark value={priority} />
                <span
                  className={cn(
                    "flex-1",
                    priority === 0 && "text-muted-foreground",
                  )}
                >
                  {COPY.priorities[priority]}
                </span>
                {priority === 3 ? (
                  <span className="text-muted-foreground text-(length:--fs-caption)">
                    {COPY.mediumInLinear}
                  </span>
                ) : null}
                {selected ? (
                  <DoneIcon aria-hidden="true" className="size-4 shrink-0" />
                ) : null}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
