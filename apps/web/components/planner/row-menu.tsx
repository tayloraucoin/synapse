"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EditIcon,
  MoreIcon,
  MoveDownIcon,
  MoveUpIcon,
  NotTodayIcon,
  SwapIcon,
} from "@syn/ui";

/**
 * RowMenu — a Now row's menu (USE-18; day/now/states/row-long-press.md).
 * Long-press on the row's body (about the platform's 500 ms), its
 * context-menu key or right-click, or its More action opens it. The row lifts
 * over a scrim, tabs included, on the background with the card's radius,
 * 8 px wider all round; the menu sits under it from the left edge (D-USE-28).
 * Tapping the scrim or Escape closes it, focus back on the row.
 *
 * The grip is never a long-press: it drags (D-USE-17). Props only.
 */
export interface RowMenuWords {
  swap: string;
  edit: string;
  moveUp: string;
  moveDown: string;
  notToday: string;
  /** "More for Cold bath": the keyboard and screen-reader way in. */
  more: string;
  /** The menu's own name: "Cold bath options". */
  menu: string;
}

export interface RowMenuProps {
  /** The row, in place. */
  children: React.ReactNode;
  /**
   * The row as it lifts above the scrim: drawn again, inert, so the live
   * row's refs (the grip's drag handle) stay on the row.
   */
  clone: React.ReactNode;
  words: RowMenuWords;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSwap: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onNotToday: () => void;
}

/** About the platform's long-press (the dev's call: 500 ms). */
export const LONG_PRESS_MS = 500;
/** A finger that travels this far is scrolling, not holding. */
const SLOP_PX = 8;

const ROW =
  "min-h-(--target) gap-(--space-3) px-(--space-3) text-(length:--fs-body) text-ink";
const GLYPH = "text-text-muted size-4";

export function RowMenu({
  children,
  clone,
  words,
  open,
  onOpenChange,
  canMoveUp,
  canMoveDown,
  onSwap,
  onEdit,
  onMoveUp,
  onMoveDown,
  onNotToday,
}: RowMenuProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const returnTo = React.useRef<HTMLElement | null>(null);
  const press = React.useRef<{
    timer: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  const swallowClick = React.useRef(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  // The lifted clone sits where the row is; measured on open.
  React.useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      if (rowRef.current) setRect(rowRef.current.getBoundingClientRect());
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  function openFrom(target: HTMLElement | null) {
    const row = rowRef.current;
    returnTo.current =
      target && row?.contains(target) && target.tabIndex >= 0
        ? target
        : (row?.querySelector<HTMLElement>("[data-row-open]") ?? null);
    onOpenChange(true);
  }

  function cancelPress() {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }

  function onPointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    // The grip drags; it never opens the menu.
    if ((event.target as HTMLElement).closest("[data-grip]")) return;
    cancelPress();
    const target = event.target as HTMLElement;
    press.current = {
      x: event.clientX,
      y: event.clientY,
      timer: setTimeout(() => {
        press.current = null;
        swallowClick.current = true;
        openFrom(target.closest("button"));
      }, LONG_PRESS_MS),
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    const start = press.current;
    if (!start) return;
    if (
      Math.abs(event.clientX - start.x) > SLOP_PX ||
      Math.abs(event.clientY - start.y) > SLOP_PX
    ) {
      cancelPress();
    }
  }

  React.useEffect(() => cancelPress, []);

  return (
    <>
      <div
        ref={rowRef}
        className="relative flex min-w-0 flex-1 items-center select-none [-webkit-touch-callout:none]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        // Right-click, a touch's own long-press and the context-menu key.
        onContextMenu={(event) => {
          if ((event.target as HTMLElement).closest("[data-grip]")) return;
          event.preventDefault();
          cancelPress();
          openFrom(event.target as HTMLElement);
        }}
        // The tap that ends a long-press neither checks nor makes current.
        onClickCapture={(event) => {
          if (!swallowClick.current) return;
          swallowClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="min-w-0 flex-1">{children}</div>
        <button
          ref={moreRef}
          type="button"
          aria-label={words.more}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => openFrom(moreRef.current)}
          // Out of sight until focused: the long-press has no keyboard.
          className={cn(
            "sr-only focus-visible:not-sr-only",
            "text-text-muted focus-visible:flex focus-visible:size-(--target) focus-visible:shrink-0 focus-visible:items-center focus-visible:justify-center focus-visible:rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <MoreIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        {open && rect
          ? createPortal(
              <>
                <div
                  aria-hidden="true"
                  className="fixed inset-0 z-40 bg-(--scrim)"
                  onClick={() => onOpenChange(false)}
                />
                <div
                  aria-hidden="true"
                  inert
                  className="bg-background fixed z-40 rounded-(--radius-card) p-(--space-2)"
                  style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    transform:
                      "translate(calc(-1 * var(--space-2)), calc(-1 * var(--space-2)))",
                    boxSizing: "content-box",
                  }}
                >
                  {clone}
                  <DropdownMenuTrigger asChild>
                    <span className="absolute bottom-0 left-(--space-2) size-0" />
                  </DropdownMenuTrigger>
                </div>
              </>,
              document.body,
            )
          : null}
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          aria-label={words.menu}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnTo.current?.focus();
          }}
          className="w-(--menu-w) rounded-(--radius-sheet) bg-background p-0 shadow-menu motion-reduce:animate-none"
        >
          <div className="py-(--space-1)">
            <DropdownMenuItem className={ROW} onSelect={onSwap}>
              <SwapIcon aria-hidden="true" className={GLYPH} />
              {words.swap}
            </DropdownMenuItem>
            <DropdownMenuItem className={ROW} onSelect={onEdit}>
              <EditIcon aria-hidden="true" className={GLYPH} />
              {words.edit}
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="mx-0 my-0" />
          <div className="py-(--space-1)">
            <DropdownMenuItem
              className={ROW}
              disabled={!canMoveUp}
              onSelect={onMoveUp}
            >
              <MoveUpIcon aria-hidden="true" className={GLYPH} />
              {words.moveUp}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={ROW}
              disabled={!canMoveDown}
              onSelect={onMoveDown}
            >
              <MoveDownIcon aria-hidden="true" className={GLYPH} />
              {words.moveDown}
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="mx-0 my-0" />
          <div className="py-(--space-1)">
            <DropdownMenuItem className={ROW} onSelect={onNotToday}>
              <NotTodayIcon aria-hidden="true" className={GLYPH} />
              {words.notToday}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
