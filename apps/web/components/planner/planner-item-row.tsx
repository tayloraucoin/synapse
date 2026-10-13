"use client";

import { Checkbox, cn, Text } from "@syn/ui";

/**
 * PlannerItemRow — a non-work item on a day: a to-do, a block's set item, a
 * reminder (USE-10; Today's To-dos, working state). Checkbox, emoji in its
 * 18 px slot, title, and on the right its words ("daily · 14:00", "Call").
 * Checked, the title recedes and stays live (P-A07). Props only.
 *
 * Named apart from `@syn/ui`'s legacy `ItemRow`.
 */
export interface PlannerItemRowView {
  id: string;
  title: string;
  emoji: string | null;
  checked: boolean;
  /** The right column: "daily · 14:00". */
  meta: string | null;
}

export interface PlannerItemRowProps {
  item: PlannerItemRowView;
  onCheckedChange?: (id: string, checked: boolean) => void;
  onOpen?: (id: string) => void;
  className?: string;
}

export function PlannerItemRow({
  item,
  onCheckedChange,
  onOpen,
  className,
}: PlannerItemRowProps) {
  return (
    <div
      data-planner-item-row={item.id}
      data-checked={item.checked || undefined}
      className={cn(
        "hover:bg-surface flex min-h-(--target) items-center rounded-(--radius-control) pe-(--space-2)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        className,
      )}
    >
      <span className="flex size-(--target) shrink-0 items-center justify-center">
        <Checkbox
          checked={item.checked}
          aria-label={item.title}
          onCheckedChange={(value) =>
            onCheckedChange?.(item.id, value === true)
          }
        />
      </span>
      <button
        type="button"
        onClick={() => onOpen?.(item.id)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.75 text-start"
      >
        <span
          aria-hidden="true"
          className="font-emoji inline-flex w-4.5 shrink-0 justify-center text-(length:--fs-body) leading-none"
        >
          {item.emoji}
        </span>
        <Text
          as="span"
          variant="body"
          tone={item.checked ? "muted" : "ink"}
          truncate
        >
          {item.title}
        </Text>
      </button>
      {item.meta ? (
        <Text
          as="span"
          variant="caption"
          tone="muted"
          className="shrink-0 ps-(--space-2) tabular-nums"
        >
          {item.meta}
        </Text>
      ) : null}
    </div>
  );
}
