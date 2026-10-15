"use client";

import * as React from "react";
import Link from "next/link";
import {
  BlockMenuIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type LucideIcon,
} from "@syn/ui";

/**
 * NowBlockMenu — ··· alone on Now's block header (USE-17; D-USE-24,
 * D-USE-26, D-USE-28): a pull-down titled with its scope, "Wellness, today",
 * its trailing edge on the column's. Background token, hairline, 10 px
 * radius, one soft shadow, no scrim: it covers the rows beneath and the
 * screen stays sharp.
 *
 * Pressed, the round button fills ink with white dots, paired with Radix's
 * `aria-expanded` (never colour alone). Props only.
 */
export interface NowBlockMenuRow {
  label: string;
  icon: LucideIcon;
  /** A link, or an action. */
  href?: string;
  onSelect?: () => void;
  /** A hairline before this row. */
  separated?: boolean;
}

export interface NowBlockMenuProps {
  /** The trigger's name: "Wellness options". */
  label: string;
  /** The scope: "Wellness, today". */
  title: string;
  rows: readonly NowBlockMenuRow[];
  /** Open on load, for `?state=header-menu`. */
  defaultOpen?: boolean;
}

const ROW =
  "min-h-(--target) gap-(--space-3) px-(--space-4) text-(length:--fs-body) text-foreground";
const GLYPH = "size-4 text-muted-foreground";

export function NowBlockMenu({
  label,
  title,
  rows,
  defaultOpen = false,
}: NowBlockMenuProps) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          "inline-flex size-(--target) shrink-0 items-center justify-center rounded-full outline-none",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            "transition-colors duration-(--dur-state) ease-(--ease-settle)",
            open
              ? "bg-foreground text-background"
              : "bg-surface text-foreground",
          )}
        >
          <BlockMenuIcon className="size-4" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className={cn(
          "w-60 rounded-(--radius-sheet) bg-background p-0 py-(--space-1) shadow-menu",
          "motion-reduce:animate-none",
        )}
      >
        <DropdownMenuLabel className="px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium text-muted-foreground">
          {title}
        </DropdownMenuLabel>
        {rows.map((row) => {
          const Icon = row.icon;
          const content = (
            <>
              <Icon aria-hidden="true" className={GLYPH} />
              {row.label}
            </>
          );
          return (
            <React.Fragment key={row.label}>
              {row.separated ? (
                <DropdownMenuSeparator className="mx-(--space-4) my-(--space-1)" />
              ) : null}
              {row.href !== undefined ? (
                <DropdownMenuItem asChild className={ROW}>
                  <Link href={row.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className={ROW} onSelect={row.onSelect}>
                  {content}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
