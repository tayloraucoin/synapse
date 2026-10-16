"use client";

import Link from "next/link";
import { Button, cn, LinearStatusGlyph } from "@syn/ui";
import type { PoolSheetRow as Row } from "@/lib/data/pool-sheet";
import { POOL_SHEET_COPY as COPY } from "./copy";

/**
 * PoolSheetRow — one row of the phone's pool (pool-sheet-anatomy.md › Rows):
 * at least 60 px on a hairline, the lead slot (the emoji in 18 px, or on
 * From Linear the status shape as Linear draws it, D-USE-35), the title over
 * the meta, and Place. Two stops: the row opens its Item sheet and places
 * nothing; only Place places (C-USE-place-from-the-pool-pool-sheet-2). A row
 * already on a day is faded and has no Place.
 */
export interface PoolSheetRowProps {
  row: Row;
  /** The Item sheet's route; absent on an issue not in the pool [ASSUMPTION]. */
  href?: string;
  onPlace: () => void;
}

export function PoolSheetRow({ row, href, onPlace }: PoolSheetRowProps) {
  const words = (
    <>
      <span className="text-(length:--fs-body) leading-(--lh-body) block truncate">
        {row.title}
      </span>
      <span
        className={cn(
          "text-(length:--fs-caption) leading-(--lh-caption) block truncate",
          row.faded ? "text-text-disabled" : "text-muted-foreground",
        )}
      >
        {row.meta}
      </span>
    </>
  );
  return (
    <li
      data-pool-sheet-row={row.key}
      data-faded={row.faded ? "" : undefined}
      className="border-hairline relative flex min-h-15 items-center gap-(--space-3) border-b last:border-b-0"
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-4.5 shrink-0 items-center justify-center leading-none",
          row.faded && "opacity-50",
        )}
      >
        {row.lead.kind === "status" ? (
          <LinearStatusGlyph
            type={row.lead.status.type}
            progress={row.lead.status.progress}
            color={row.lead.status.color}
            className="size-3.5"
          />
        ) : (
          <span className="font-emoji text-(length:--fs-body)">
            {row.lead.emoji}
          </span>
        )}
      </span>
      {href ? (
        <Link
          href={href}
          scroll={false}
          aria-label={row.label}
          className={cn(
            "min-w-0 flex-1 rounded-(--radius-control) py-(--space-2) outline-none focus-visible:ring-2 focus-visible:ring-ring",
            row.faded ? "text-text-disabled" : "text-foreground",
          )}
        >
          {words}
        </Link>
      ) : (
        <span
          className={cn(
            "min-w-0 flex-1 py-(--space-2)",
            row.faded ? "text-text-disabled" : "text-foreground",
          )}
        >
          {words}
        </span>
      )}
      {row.placeable ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onPlace}
          aria-label={COPY.placeName(row.title)}
          // 32 px drawn; the hit area keeps 44 (pool-sheet.md › Access).
          className="relative h-8 shrink-0 rounded-(--radius-control) px-(--space-3) font-semibold after:absolute after:-inset-1.5"
        >
          {COPY.place}
        </Button>
      ) : null}
    </li>
  );
}
