/**
 * Breadcrumb — the way back from a focused screen (USE-31; D-USE-10): a
 * 14 px chevron and the screen it returns to ("‹ Orient"), label size,
 * medium, muted, on a 24 px row over the screen's title. It replaces a
 * "Back to …" line.
 *
 * A link, not a history back: it always lands where it says, however the
 * screen was reached. Its accessible name says the direction ("Back to
 * Orient"); the visible word stays the place.
 *
 * The row is 24 px, the tap is the target: the link grows to the target
 * height with negative margins so the title keeps its 2 px.
 *
 * THE CURRENT CRUMB (USE-48): `current` adds "› Wellness" after the link,
 * the separator muted and the place in ink, `aria-current="page"`, not a
 * link. Block view's "‹ Today › Wellness".
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "../../../lib/cn";

export interface BreadcrumbProps {
  /** The place it returns to: "Orient". */
  label: string;
  href: string;
  /** "Back to Orient". */
  ariaLabel: string;
  /** The screen itself, after the link: "Wellness". */
  current?: string;
  className?: string;
}

export function Breadcrumb({
  label,
  href,
  ariaLabel,
  current,
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex h-6 items-center", className)}
    >
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          "-my-(--space-2) -ms-(--space-1) inline-flex min-h-(--target) items-center gap-(--space-1) rounded-(--radius-control) px-(--space-1)",
          "text-(length:--fs-label) leading-(--lh-label) font-medium text-muted-foreground",
          "transition-colors duration-(--dur-state) ease-(--ease-settle) hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <ChevronLeftIcon aria-hidden="true" className="size-3.5 shrink-0" />
        {label}
      </Link>
      {current === undefined ? null : (
        <>
          <span
            aria-hidden="true"
            className="px-(--space-1) text-(length:--fs-label) leading-(--lh-label) text-muted-foreground"
          >
            ›
          </span>
          <span
            aria-current="page"
            className="min-w-0 truncate text-(length:--fs-label) leading-(--lh-label) font-medium text-foreground"
          >
            {current}
          </span>
        </>
      )}
    </nav>
  );
}
