"use client";

import * as React from "react";
import { cn } from "@syn/ui";

/**
 * SheetStep — a step inside the sheet that opened it, as the icon picker is
 * in the New block sheet (USE-146; icon-picker/index.md). It slides in from
 * the right on `--dur-sheet` and back out at about 80% of that (canon
 * C-P11: a spatial relationship, ease-out, transform and opacity only); under
 * reduced motion the tokens are 0 ms and it simply swaps.
 *
 * The sheet's height is locked at the moment the step opens and released
 * when it unmounts, so switching the picker's tabs or typing a search never
 * resizes the drawer. The opener measures it (`sheetHeight`) as the step is
 * asked for, before the sheet's header and footer step aside. Props only.
 */

const SHEET = "[data-vaul-drawer], [role='dialog']";

/** The height of the sheet around an element, to hold while a step shows. */
export function sheetHeight(inside: HTMLElement | null): number | null {
  const sheet = inside?.closest<HTMLElement>(SHEET);
  return sheet ? sheet.getBoundingClientRect().height : null;
}

export interface SheetStepProps {
  /** The sheet's height when the step was asked for (`sheetHeight`). */
  height: number | null;
  /** Sliding back out: `onLeft` runs once it has. */
  leaving: boolean;
  onLeft: () => void;
  children: React.ReactNode;
  className?: string;
}

/** The longest an exit waits for its animation's end, in case none fires. */
const EXIT_FALLBACK_MS = 300;

export function SheetStep({
  height,
  leaving,
  onLeft,
  children,
  className,
}: SheetStepProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // The sheet's own element: vaul's drawer, or the dialog at the split break.
  React.useLayoutEffect(() => {
    const sheet = ref.current?.closest<HTMLElement>(SHEET);
    if (!sheet) return;
    const before = sheet.style.height;
    sheet.style.height = `${height ?? sheet.getBoundingClientRect().height}px`;
    return () => {
      sheet.style.height = before;
    };
    // Locked once, as the step opens: `height` is read at mount only.
  }, []);

  const left = React.useRef(onLeft);
  left.current = onLeft;
  React.useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => left.current(), EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  return (
    <div
      ref={ref}
      data-leaving={leaving || undefined}
      onAnimationEnd={(event) => {
        if (leaving && event.target === event.currentTarget) left.current();
      }}
      className={cn(
        "flex min-h-0 flex-1 flex-col ease-(--ease-settle)",
        leaving
          ? "animate-out fade-out-0 slide-out-to-right fill-mode-forwards duration-[calc(var(--dur-sheet)*0.8)]"
          : "animate-in fade-in-0 slide-in-from-right duration-(--dur-sheet)",
        className,
      )}
    >
      {children}
    </div>
  );
}
