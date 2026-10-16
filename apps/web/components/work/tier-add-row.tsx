"use client";

import { AddIcon, Button, cn, Text, useDropTarget } from "@syn/ui";

/**
 * TierAddRow — an empty tier's row on Today with nothing slotted (USE-82;
 * nothing-planned.md, no-work-slotted.md). On the phone, "+ Add to Primary"
 * over a hairline (D-USE-56). At the desk, "+ Add to Secondary" shown always,
 * and the tier takes a pool row dropped on it (USE-75's DragToPlace, by
 * `dropId`), shaded fill-muted while one is over it; `dashed` draws the
 * board's drop zone, "Drop here, or + Add to Primary". The add opens New
 * task with the tier set; its name always carries the tier. Props only.
 */
export interface TierAddRowProps {
  variant: "desk" | "phone";
  /** "+ Add to Primary" at the desk, "Add to Primary" on the phone. */
  label: string;
  /** "Add to Primary". */
  name: string;
  /** "Drop here, or": the dashed zone's lead; none draws a plain row. */
  dropLead?: string;
  /** The drop target's id (`PLACE_IDS.cell`); none takes no drop. */
  dropId?: string;
  onAdd: () => void;
}

export function TierAddRow({
  variant,
  label,
  name,
  dropLead,
  dropId,
  onAdd,
}: TierAddRowProps) {
  const drop = useDropTarget(dropId ?? "", { disabled: !dropId });

  if (variant === "phone") {
    return (
      <button
        type="button"
        aria-label={name}
        onClick={onAdd}
        className="flex min-h-11 w-full items-center gap-(--space-3) border-b border-hairline text-start text-muted-foreground outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AddIcon aria-hidden="true" className="size-4 shrink-0" />
        <Text as="span" variant="body" tone="muted">
          {label}
        </Text>
      </button>
    );
  }

  return (
    <div
      ref={drop.ref}
      data-tier-drop={dropId}
      className={cn(
        "flex min-h-10 items-center rounded-(--radius-control)",
        dropLead
          ? "mt-(--space-2) border border-dashed border-text-muted px-(--space-3)"
          : "-ms-(--space-3)",
        drop.isOver && "bg-fill-muted",
      )}
    >
      {dropLead ? (
        <Text as="span" variant="secondary" tone="muted">
          {dropLead}&nbsp;
        </Text>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        aria-label={name}
        onClick={onAdd}
        className={cn(
          "font-normal text-muted-foreground hover:text-ink",
          dropLead && "-ms-(--space-3) hover:bg-transparent",
        )}
      >
        {label}
      </Button>
    </div>
  );
}
