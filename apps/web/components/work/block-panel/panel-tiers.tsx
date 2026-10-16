"use client";

import type * as React from "react";
import type { WorkTier } from "@syn/types";
import {
  cn,
  GroupHeading,
  HueSquare,
  ReorderIcon,
  SortableHandle,
  SortableList,
  useDropTarget,
} from "@syn/ui";
import { TIER_HUE } from "@/components/work/view";
import type { BlockPanelTier, BlockPanelWorkRow } from "@/lib/data/block-panel";

/**
 * PanelTiers — a Work block's body in its panel (USE-76; states/
 * work-block.md): the block's slice of the day's tiers, each a heading with
 * its colour square (D-USE-38), its rows and its "+ Add to <tier>" row. A
 * row: the grip at the leading edge, the emoji slot (D-USE-48), the title
 * over the meta, the range trailing. The panel plans: no firing mark, ring,
 * checkbox, Start or Done (C-USE-block-panel-work-block-4). A grip reorders
 * within its tier; each tier takes a pool row dropped on it (`dropId`, USE-75's
 * DragToPlace). [ASSUMPTION] USE-50's editing tiers are not built yet, so the
 * desk draws the tiers from the house parts; folding the two is USE-50's.
 * Props only.
 */
export interface PanelTiersProps {
  tiers: readonly BlockPanelTier[];
  onReorder: (tier: WorkTier, ids: string[]) => void;
  /** The title: to the Item sheet. */
  title: (row: BlockPanelWorkRow) => React.ReactNode;
  /** The tier's add row; null draws none (from Today). */
  addRow?: ((tier: WorkTier, word: string) => React.ReactNode) | null;
  /** The tier's drop target id; null takes no drops. */
  dropId?: ((tier: WorkTier) => string) | null;
}

export function PanelTiers({
  tiers,
  onReorder,
  title,
  addRow = null,
  dropId = null,
}: PanelTiersProps) {
  return (
    <div data-panel-tiers className="flex flex-col gap-(--space-4)">
      {tiers.map((section) => (
        <TierSection
          key={section.tier}
          section={section}
          onReorder={onReorder}
          title={title}
          add={addRow ? addRow(section.tier, section.word) : null}
          dropId={dropId ? dropId(section.tier) : null}
        />
      ))}
    </div>
  );
}

function TierSection({
  section,
  onReorder,
  title,
  add,
  dropId,
}: {
  section: BlockPanelTier;
  onReorder: PanelTiersProps["onReorder"];
  title: PanelTiersProps["title"];
  add: React.ReactNode;
  dropId: string | null;
}) {
  const drop = useDropTarget(dropId ?? `none:${section.tier}`, {
    disabled: dropId === null,
  });
  const takesRow = drop.isOver && (drop.carriedId?.startsWith("row:") ?? false);
  return (
    <section
      ref={drop.ref}
      data-tier-group={section.tier}
      aria-label={section.word}
      className={cn(
        "flex flex-col rounded-(--radius-control)",
        takesRow && "bg-muted",
      )}
    >
      <GroupHeading
        as="h3"
        leading={<HueSquare hue={TIER_HUE[section.tier]} />}
      >
        {section.word}
      </GroupHeading>
      {section.rows.length > 0 ? (
        <SortableList
          items={section.rows}
          label={section.word}
          onReorder={(ids) => onReorder(section.tier, ids)}
          itemClassName="block border-0 data-lifted:opacity-100"
          renderItem={(row, { handleProps, isLifted }) => (
            <div
              data-panel-row={row.id}
              className={cn(
                "flex min-h-13 items-center gap-2.5 border-b border-hairline px-1 py-(--space-2)",
                isLifted &&
                  "rounded-(--radius-control) border border-ink bg-surface",
              )}
            >
              <span data-grip className="flex shrink-0">
                <SortableHandle
                  {...handleProps}
                  className={cn(
                    handleProps.className,
                    "rounded-(--radius-control) text-text-muted",
                  )}
                >
                  <ReorderIcon aria-hidden="true" className="size-3.5" />
                </SortableHandle>
              </span>
              <span
                aria-hidden="true"
                className="flex w-4.5 shrink-0 justify-center"
              >
                {row.emoji}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-(length:--fs-body) text-ink">
                  {title(row)}
                </span>
                {row.meta ? (
                  <span className="truncate text-(length:--fs-caption) leading-(--lh-caption) text-text-muted">
                    {row.meta}
                  </span>
                ) : null}
              </div>
              {row.range ? (
                <span className="shrink-0 text-(length:--fs-caption) leading-(--lh-caption) text-text-muted tabular-nums">
                  {row.range}
                </span>
              ) : null}
            </div>
          )}
        />
      ) : null}
      {add}
    </section>
  );
}
