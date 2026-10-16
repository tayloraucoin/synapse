"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { WorkTier } from "@syn/types";
import {
  cn,
  DoneIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  FiringMark,
  FromPoolIcon,
  MoreIcon,
  MoveToIcon,
  OpenInLinearIcon,
  ResumeIcon,
  TaskToTierIcon,
} from "@syn/ui";
import { LONG_PRESS_MS } from "@/components/planner/row-menu";
import type { WorkRowView } from "./view";

/**
 * WorkMenu — a work row's menu on Today and Now (USE-70; D-USE-57, D-USE-65;
 * work/today/states/work-menu.md). The same seven actions both ways in:
 *
 * - The phone: a long-press (about 500 ms, touch or pen) dims the screen and
 *   lifts the row as a raised card with its trimmed meta; the menu opens on
 *   the side with room, above when it fits. A tap on the scrim closes it.
 * - The desk: a right-click opens it at the pointer as a context menu, no
 *   lift; the keyboard's context-menu key opens it under the row.
 * - Either: "More for <title>", out of sight until focused, the way in for
 *   a keyboard and a screen reader (D-USE-53).
 *
 * The long-press swallows the tap that ends it, so no sheet opens; travel of
 * a few pixels is a scroll or a swipe and cancels it. Start, Prompt sent
 * ("Bring back" on a firing row), Done; a rule; Move to tier › (the tiers,
 * the current one checked), Move to another day, Back to the pool; a rule;
 * Open in Linear, only on a linked item. Props only: it writes nothing.
 */
export interface WorkMenuView {
  /** "[SMS copy] options": the menu's own name. */
  label: string;
  /** "More for [SMS copy]". */
  more: string;
  start: string;
  /** "Prompt sent", or "Bring back" on a firing row. */
  fire: string;
  firing: boolean;
  done: string;
  moveToTier: string;
  tiers: { tier: WorkTier; word: string; current: boolean }[];
  moveToDay: string;
  backToPool: string;
  /** "Open in Linear"; null on a Synapse-only item. */
  openInLinear: string | null;
}

export interface WorkMenuActions {
  onStart: () => void;
  onFire: () => void;
  onDone: () => void;
  onMoveToTier: (tier: WorkTier) => void;
  onMoveToDay: () => void;
  onBackToPool: () => void;
  onOpenInLinear: () => void;
}

export interface WorkMenuProps {
  children: React.ReactNode;
  /** The row as it lifts (`WorkMenuLift`), drawn again and inert. */
  clone: React.ReactNode;
  view: WorkMenuView;
  actions: WorkMenuActions;
  /** The desk: no lift, the menu at the pointer. */
  atDesk: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A finger that travels this far is scrolling or swiping, not holding. */
const SLOP_PX = 8;

const ROW =
  "min-h-(--target) gap-(--space-3) px-(--space-3) text-(length:--fs-body) text-ink";
const GLYPH = "text-text-muted size-4";

type Anchor =
  { kind: "row"; rect: DOMRect } | { kind: "point"; x: number; y: number };

export function WorkMenu({
  children,
  clone,
  view,
  actions,
  atDesk,
  open,
  onOpenChange,
}: WorkMenuProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const returnTo = React.useRef<HTMLElement | null>(null);
  const press = React.useRef<{
    timer: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  const swallowClick = React.useRef(false);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);

  // Opened from outside (a scenario): under the row; closed, forgotten.
  React.useLayoutEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    if (anchor !== null || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    // A row not on screen (the other width's tree) opens nothing.
    if (rect.width === 0) onOpenChange(false);
    else setAnchor({ kind: "row", rect });
  }, [open, anchor, onOpenChange]);

  // The row moves with the page; measured again while the menu is open.
  React.useLayoutEffect(() => {
    if (!open || anchor?.kind !== "row") return;
    const measure = () => {
      if (rowRef.current)
        setAnchor({
          kind: "row",
          rect: rowRef.current.getBoundingClientRect(),
        });
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, anchor?.kind]);

  function openAt(
    target: HTMLElement | null,
    point?: { x: number; y: number },
  ) {
    const row = rowRef.current;
    if (!row) return;
    returnTo.current =
      target && row.contains(target) && target.tabIndex >= 0
        ? target
        : (row.querySelector<HTMLElement>("[data-open]") ?? null);
    setAnchor(
      point && atDesk
        ? { kind: "point", ...point }
        : { kind: "row", rect: row.getBoundingClientRect() },
    );
    onOpenChange(true);
  }

  function cancelPress() {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }

  React.useEffect(() => cancelPress, []);

  const lift = open && !atDesk && anchor?.kind === "row";

  return (
    <>
      <div
        ref={rowRef}
        data-work-menu-row
        className="relative flex min-w-0 items-stretch select-none [-webkit-touch-callout:none]"
        onPointerDown={(event) => {
          // A mouse right-clicks at the desk; the long-press is a thumb's.
          if (event.pointerType === "mouse" || event.button !== 0) return;
          cancelPress();
          const target = event.target as HTMLElement;
          press.current = {
            x: event.clientX,
            y: event.clientY,
            timer: setTimeout(() => {
              press.current = null;
              swallowClick.current = true;
              openAt(target.closest("button"));
            }, LONG_PRESS_MS),
          };
        }}
        onPointerMove={(event) => {
          const start = press.current;
          if (!start) return;
          if (
            Math.abs(event.clientX - start.x) > SLOP_PX ||
            Math.abs(event.clientY - start.y) > SLOP_PX
          )
            cancelPress();
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        // Right-click, a touch's own long-press and the context-menu key.
        onContextMenu={(event) => {
          event.preventDefault();
          if (open) return;
          cancelPress();
          // The key reports no pointer: the menu goes under the row.
          const fromKey = event.clientX === 0 && event.clientY === 0;
          openAt(
            event.target as HTMLElement,
            fromKey ? undefined : { x: event.clientX, y: event.clientY },
          );
        }}
        // The tap that ends a long-press opens no sheet.
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
          aria-label={view.more}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => openAt(moreRef.current)}
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
        {open && anchor
          ? createPortal(
              anchor.kind === "point" ? (
                <DropdownMenuTrigger asChild>
                  <span
                    aria-hidden="true"
                    className="fixed size-0"
                    style={{ top: anchor.y, left: anchor.x }}
                  />
                </DropdownMenuTrigger>
              ) : (
                <>
                  {lift ? (
                    <div
                      aria-hidden="true"
                      className="fixed inset-0 z-40 bg-(--scrim)"
                      onClick={() => onOpenChange(false)}
                    />
                  ) : null}
                  <div
                    aria-hidden="true"
                    inert
                    className={cn(
                      "fixed z-40",
                      lift &&
                        "bg-background shadow-menu rounded-(--radius-card) p-(--space-2)",
                    )}
                    style={{
                      top: anchor.rect.top,
                      left: anchor.rect.left,
                      width: anchor.rect.width,
                      transform: lift
                        ? "translate(calc(-1 * var(--space-2)), calc(-1 * var(--space-2)))"
                        : undefined,
                      boxSizing: "content-box",
                    }}
                  >
                    {lift ? clone : null}
                    <DropdownMenuTrigger asChild>
                      <span
                        className="absolute inset-0"
                        style={lift ? { inset: "var(--space-2)" } : undefined}
                      />
                    </DropdownMenuTrigger>
                  </div>
                </>
              ),
              document.body,
            )
          : null}
        <DropdownMenuContent
          align="start"
          side={anchor?.kind === "point" ? "bottom" : lift ? "top" : "bottom"}
          sideOffset={anchor?.kind === "point" ? 2 : 12}
          collisionPadding={8}
          aria-label={view.label}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnTo.current?.focus();
          }}
          className="bg-background shadow-menu w-(--menu-w) rounded-(--radius-sheet) p-0 motion-reduce:animate-none"
        >
          <div className="py-(--space-1)">
            <DropdownMenuItem className={ROW} onSelect={actions.onStart}>
              <ResumeIcon aria-hidden="true" className={GLYPH} />
              {view.start}
            </DropdownMenuItem>
            <DropdownMenuItem className={ROW} onSelect={actions.onFire}>
              <span
                aria-hidden="true"
                className="inline-flex size-4 items-center justify-center"
              >
                <FiringMark
                  className={view.firing ? undefined : "opacity-80"}
                />
              </span>
              {view.fire}
            </DropdownMenuItem>
            <DropdownMenuItem className={ROW} onSelect={actions.onDone}>
              <DoneIcon aria-hidden="true" className={GLYPH} />
              {view.done}
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="mx-0 my-0" />
          <div className="py-(--space-1)">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(ROW, "rounded-(--radius) py-1.5")}
              >
                <TaskToTierIcon aria-hidden="true" className={GLYPH} />
                {view.moveToTier}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                {/* At 402 a menu leaves no room beside it: the tiers overlap it. */}
                <DropdownMenuSubContent
                  collisionPadding={8}
                  sideOffset={atDesk ? 0 : -64}
                  className="bg-background shadow-menu min-w-40 rounded-(--radius-sheet) p-0 py-(--space-1) motion-reduce:animate-none"
                >
                  {view.tiers.map((tier) => (
                    <DropdownMenuItem
                      key={tier.tier}
                      className={ROW}
                      aria-current={tier.current || undefined}
                      onSelect={() => {
                        if (!tier.current) actions.onMoveToTier(tier.tier);
                      }}
                    >
                      <span className="flex-1">{tier.word}</span>
                      {tier.current ? (
                        <DoneIcon aria-hidden="true" className={GLYPH} />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem className={ROW} onSelect={actions.onMoveToDay}>
              <MoveToIcon aria-hidden="true" className={GLYPH} />
              {view.moveToDay}
            </DropdownMenuItem>
            <DropdownMenuItem className={ROW} onSelect={actions.onBackToPool}>
              <FromPoolIcon aria-hidden="true" className={GLYPH} />
              {view.backToPool}
            </DropdownMenuItem>
          </div>
          {view.openInLinear ? (
            <>
              <DropdownMenuSeparator className="mx-0 my-0" />
              <div className="py-(--space-1)">
                <DropdownMenuItem
                  className={ROW}
                  onSelect={actions.onOpenInLinear}
                >
                  <OpenInLinearIcon aria-hidden="true" className={GLYPH} />
                  {view.openInLinear}
                </DropdownMenuItem>
              </div>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

/**
 * WorkMenuLift — the row as it lifts over the scrim (work-menu-402): the
 * ring, the emoji and title, and the trimmed meta in one line, "KES-51 ·
 * Normal · 2 Small · 30 to 60 min".
 */
export function WorkMenuLift({ row }: { row: WorkRowView }) {
  const meta = [
    row.identifier ?? row.noLinear,
    row.priority?.word,
    row.size,
    row.length,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="flex items-start">
      <span className="flex size-(--target) shrink-0 items-center justify-center">
        {row.form === "firing" ? (
          <FiringMark halo />
        ) : (
          <span className="border-edge size-2.5 rounded-full border-[1.5px]" />
        )}
      </span>
      <div className="min-w-0 flex-1 py-(--space-2)">
        <p className="text-ink m-0 flex items-start gap-1.75 text-(length:--fs-body) leading-(--lh-body)">
          <span className="font-emoji inline-flex w-4.5 shrink-0 justify-center leading-(--lh-body)">
            {row.emoji}
          </span>
          <span className="min-w-0">{row.title}</span>
        </p>
        <p className="text-muted-foreground m-0 pt-(--space-1) text-(length:--fs-caption) leading-(--lh-caption)">
          {meta}
        </p>
      </div>
    </div>
  );
}
