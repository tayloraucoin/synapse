"use client";

import * as React from "react";
import Link from "next/link";
import { CloseIcon, cn } from "@syn/ui";
import { HUE_DOT, type BlockHue } from "@/components/planner/block-hue";
import { BLOCK_PANEL_COPY as COPY } from "./copy";

/**
 * BlockPanel — one block of one date at the desk (USE-76; ux/work/
 * block-panel/index.md, D-USE-41): the right panel at `--sheet-w`, full
 * height at the window's right edge, over the week. No scrim and no focus
 * trap: the week and the pool to its left stay in view and live, so a pool
 * row drags into it (C-USE-block-panel-1). [ASSUMPTION] A non-modal region
 * drawn as `ResponsiveSheet`'s right panel looks, not the sheet itself: the
 * built sheet is a modal dialog with a scrim.
 *
 * Top to bottom: the top line ("Tue 13 › Work" in words, Open day, ×), the
 * header (the block's colour bar, its name in the serif, its span and fit
 * line), the body (Block view's for the date, the caller's), then the scope
 * line under a hairline. Focus moves to the name on open; Esc or × closes
 * (the caller returns focus to the block). Desk only: hidden below 1024,
 * where a block opens the phone's Block view (C-USE-block-panel-4). Props
 * only.
 */
export interface BlockPanelProps {
  /** "Tue 13", or "Today". */
  day: string;
  name: string;
  /** "9:30 to 12:00 · ends 11:40 at the top of the ranges". */
  meta: string;
  hue: BlockHue;
  /** Open day's link and its name ("Open Tuesday 13"); null hides it (from Today). */
  openDay: { href: string; label: string } | null;
  /** The header's trailing edge, from Today: Edit and ···. */
  actions?: React.ReactNode;
  /** Under the header: the offline line. */
  status?: React.ReactNode;
  scope: string | null;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** The panel's 13 px muted lines: the top line, the span, the scope. */
const LINE = "text-(length:--fs-label) leading-(--lh-label) text-text-muted";

export function BlockPanel({
  day,
  name,
  meta,
  hue,
  openDay,
  actions = null,
  status = null,
  scope,
  onClose,
  children,
  className,
}: BlockPanelProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const opened = `${day}:${name}`;
  React.useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [opened]);

  // Esc closes, unless a dialog or menu over it takes the key first.
  const close = React.useRef(onClose);
  close.current = onClose;
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="menu"], [role="listbox"]',
        )
      ) {
        return;
      }
      close.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside
      aria-label={COPY.region(name, day)}
      data-block-panel
      className={cn(
        "fixed inset-y-0 end-0 z-30 hidden w-(--sheet-w) max-w-full flex-col gap-(--space-4) overflow-y-auto",
        "border-s border-border bg-background px-(--space-6) py-(--space-5) shadow-menu split:flex",
        className,
      )}
    >
      <div className="flex items-center gap-(--space-2)">
        <p className={cn(LINE, "min-w-0 flex-1 truncate")}>
          {COPY.crumb(day, name)}
        </p>
        {openDay ? (
          <Link
            href={openDay.href}
            aria-label={openDay.label}
            className="rounded-(--radius-control) px-(--space-1) text-(length:--fs-label) font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COPY.openDay}
          </Link>
        ) : null}
        <button
          type="button"
          aria-label={COPY.close(name)}
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="flex items-start gap-(--space-3)">
        <span
          aria-hidden="true"
          className={cn("mt-1 h-10 w-0.75 shrink-0", HUE_DOT[hue])}
        />
        <div className="min-w-0 flex-1">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-title font-medium break-words text-ink outline-none"
          >
            {name}
          </h2>
          <p className={cn(LINE, "tabular-nums")}>{meta}</p>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-(--space-1)">
            {actions}
          </div>
        ) : null}
      </div>

      {status}

      <div className="flex flex-col">{children}</div>

      {scope ? (
        <p
          data-scope-line
          className={cn(LINE, "border-t border-hairline pt-(--space-3)")}
        >
          {scope}
        </p>
      ) : null}
    </aside>
  );
}
