"use client";

import { Button, cn, Text } from "@syn/ui";

/**
 * NotDoneList — the close card's items left, opened (USE-25; block-complete
 * not-done-open): each row's name with Later and Leave, or, once moved, the
 * name muted over "Moved to the end of <Block>" with Undo. A row left with
 * Leave is gone. Nothing counts and nothing says missed.
 */
export interface NotDoneRow {
  id: string;
  title: string;
  /** "Moved to the end of Training"; null while still in the block. */
  movedLine: string | null;
  /** Null when no block follows (D-USE-74): Later is not offered. */
  later: { label: string; name: string; onPress: () => void } | null;
  leave: { label: string; name: string; onPress: () => void };
  undo: { label: string; name: string; onPress: () => void };
}

export function NotDoneList({ rows }: { rows: NotDoneRow[] }) {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li
          key={row.id}
          className="border-hairline flex min-h-(--target) items-center gap-(--space-3) border-t py-(--space-2)"
        >
          <div className="min-w-0 flex-1">
            <Text
              as="p"
              variant="body"
              tone={row.movedLine ? "muted" : "ink"}
              truncate
            >
              {row.title}
            </Text>
            {row.movedLine ? (
              <Text as="p" variant="caption" tone="muted">
                {row.movedLine}
              </Text>
            ) : null}
          </div>
          {row.movedLine ? (
            <button
              type="button"
              aria-label={row.undo.name}
              onClick={row.undo.onPress}
              className={cn(
                "text-foreground min-h-(--target) shrink-0 cursor-pointer px-(--space-2) text-(length:--fs-secondary) leading-(--lh-secondary) font-semibold underline underline-offset-4",
                "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {row.undo.label}
            </button>
          ) : (
            <div className="flex shrink-0 gap-(--space-2)">
              {row.later ? (
                <Button
                  variant="secondary"
                  size="md"
                  aria-label={row.later.name}
                  onClick={row.later.onPress}
                >
                  {row.later.label}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="md"
                aria-label={row.leave.name}
                onClick={row.leave.onPress}
              >
                {row.leave.label}
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
