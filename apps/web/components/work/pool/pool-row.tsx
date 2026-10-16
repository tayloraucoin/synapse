import Link from "next/link";
import { cn, LinearStatusGlyph, useDragSource } from "@syn/ui";
import type { PoolRowView } from "@/lib/data/pool-view";
import { DueBadge } from "../due-badge";
import { PriorityMarkGlyph } from "../priority-chip";
import { POOL_PANEL_COPY as COPY } from "./copy";

/**
 * PoolRow — one row of the pool (v3, pool-rows.md): the emoji in its 18 px
 * slot, the title, the meta line (priority glyph, ID, size chip, label
 * chips) and the due badge at the top right. A placed row is faded and names
 * its days; a Huge one offers Spread…; a Synapse-only one reads "No Linear".
 * On the Linear tab the status shape and word lead the meta. Rows are
 * list-like, a hairline under each, never cards (D-USE-42). With `href` the
 * whole row opens the Item sheet; Spread… sits above that link. With
 * `dragId`, inside the Week's DragToPlace, the row carries onto a day
 * (USE-75); its keyboard path is the day's "+ Add to <tier>".
 */
export interface PoolRowProps {
  row: PoolRowView;
  href?: string;
  onSpread?: () => void;
  /** The row's drag id (USE-75's `PLACE_IDS.row`); a plain row without one. */
  dragId?: string;
}

export function PoolRow({ row, href, onSpread, dragId }: PoolRowProps) {
  const drag = useDragSource(dragId ?? row.key, row.title, {
    disabled: dragId === undefined,
  });
  const title = (
    <span className="text-label text-foreground min-w-0 flex-1">
      {row.title}
    </span>
  );
  return (
    <div
      ref={drag.ref}
      {...drag.props}
      data-pool-row={row.key}
      data-placed={row.placed ? "" : undefined}
      className={cn(
        "relative flex gap-(--space-2) border-b border-hairline py-(--space-2) ps-0 pe-1.5",
        href && "hover:bg-fill-muted",
        // Placed rows stay, faded (pool-rows.md); the words keep 4.5:1 on surface.
        row.placed && "opacity-60",
        drag.isDragging && "opacity-40",
      )}
    >
      <span
        aria-hidden="true"
        className="font-emoji text-label inline-flex size-4.5 shrink-0 items-center justify-center leading-none"
      >
        {row.emoji}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-(--space-2)">
          {href ? (
            <Link
              href={href}
              scroll={false}
              aria-label={row.label}
              className="min-w-0 flex-1 rounded-(--radius-control) outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {title}
            </Link>
          ) : (
            <span aria-label={row.label} className="flex min-w-0 flex-1">
              {title}
            </span>
          )}
          {row.due ? (
            <DueBadge word={row.due.word} tone={row.due.tone} />
          ) : null}
        </div>
        <div
          aria-hidden={href ? true : undefined}
          className="text-caption text-muted-foreground flex flex-wrap items-center gap-1.25"
        >
          {row.status ? (
            <LinearStatusGlyph
              type={row.status.type}
              progress={row.status.progress}
              color={row.status.color}
              className="size-3"
            />
          ) : null}
          {row.priority ? (
            <PriorityMarkGlyph
              level={row.priority.level}
              word={row.priority.word}
            />
          ) : null}
          {row.placed ? (
            <span>
              {[row.identifier ?? row.noLinear, row.size, row.placed].join(
                " · ",
              )}
            </span>
          ) : (
            <>
              <span>{row.identifier ?? row.noLinear}</span>
              {row.status ? <span>{row.status.word}</span> : null}
              <span className="bg-fill-muted text-foreground inline-flex h-4.5 items-center rounded-(--radius-control) px-1.5">
                {row.size}
              </span>
              {row.labels.map((label) => (
                <span
                  key={label.name}
                  className="border-hairline text-foreground inline-flex h-4.5 items-center gap-1 rounded-full border px-1.5"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    // Linear's own label colour: data, not a token (D-USE-42).
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </span>
              ))}
              {row.where ? <span>· {row.where}</span> : null}
            </>
          )}
          {row.spread && onSpread ? (
            <button
              type="button"
              onClick={onSpread}
              aria-label={COPY.spreadName(row.title)}
              className="text-foreground relative z-10 font-semibold underline underline-offset-2"
            >
              {COPY.spread}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
