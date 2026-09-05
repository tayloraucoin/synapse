/**
 * ResponsiveSheet — one API for two surfaces (v2 handoff §5.3).
 *
 * Adapted from CC's `SideChannelDrawer`: the media-query switch, the pinned
 * header and footer with a `min-h-0 flex-1` body, and `hideClose` when the
 * header carries its own action. Synapse's changes are the breakpoint (768px,
 * the one break — cross-cutting §2.1) and the compact side, which is Vaul's
 * `drawer` rather than a bottom `sheet` so the handle and drag-to-dismiss are
 * real (§10 D2; Epic 1 §0.3 asks for both).
 *
 * WHY ONE COMPONENT AND NOT TWO: every sheet in the product is the same
 * surface wearing two shapes. Splitting it would mean every caller writing the
 * switch, and the two shapes drifting the first time one of them gained a prop.
 *
 * THE DIRTY GUARD. When `dirty` is true, a close attempt — the corner control,
 * Esc, the scrim, a downward drag — calls `onDiscardRequest` instead of
 * closing, and the caller opens `DiscardDialog`. The guard lives here rather
 * than in each sheet because there are four ways out of a sheet and a per-form
 * guard reliably covers three of them.
 *
 * `min-h-0` on the body is load-bearing: without it a flex child refuses to
 * shrink below its content, the body never scrolls, and the pinned footer is
 * pushed off a compact screen.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { useIsWide } from "../../../lib/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../../../primitives/layout/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../../../primitives/layout/sheet";
import { Text } from "../../../primitives/typography/text";

export interface ResponsiveSheetClasses {
  content?: string;
  header?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  footer?: string;
}

export interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Announced on open; may be visually replaced by `header`. */
  title: string;
  subtitle?: React.ReactNode;
  /** Replaces the title block — the ItemSheet's identity row. */
  header?: React.ReactNode;
  /** Suppresses the corner close, CC's rule. */
  headerAction?: React.ReactNode;
  /** Pinned above the safe area. */
  footer?: React.ReactNode;
  /** Compact max-height: 60dvh | 90dvh. */
  size?: "default" | "tall";
  /** When true, a close attempt calls `onDiscardRequest` instead. */
  dirty?: boolean;
  onDiscardRequest?: () => void;
  /** Cross-cutting §3.4. */
  initialFocus?: "first-field" | "title";
  children: React.ReactNode;
  classes?: ResponsiveSheetClasses;
  className?: string;
}

export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  header,
  headerAction,
  footer,
  size = "default",
  dirty = false,
  onDiscardRequest,
  initialFocus = "title",
  children,
  classes,
  className,
}: ResponsiveSheetProps) {
  const isWide = useIsWide();
  const titleRef = React.useRef<HTMLDivElement>(null);

  /** One gate for every way out: corner, Esc, scrim, drag. */
  const requestChange = React.useCallback(
    (next: boolean) => {
      if (!next && dirty && onDiscardRequest !== undefined) {
        onDiscardRequest();
        return;
      }
      onOpenChange(next);
    },
    [dirty, onDiscardRequest, onOpenChange],
  );

  const titleBlock =
    header !== undefined ? (
      header
    ) : (
      <div ref={titleRef} tabIndex={-1} className={cn("min-w-0 flex-1 outline-none")}>
        <Text as="h2" variant="heading" className={classes?.title}>
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text
            as="p"
            variant="secondary"
            tone="secondary"
            className={classes?.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </div>
    );

  const frame = (
    <>
      <div
        className={cn(
          "flex min-h-(--header-h) shrink-0 items-start gap-(--space-3)",
          "px-(--space-4) pt-(--space-4)",
          classes?.header,
        )}
      >
        {titleBlock}
        {headerAction === undefined ? null : (
          <div className="shrink-0">{headerAction}</div>
        )}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-(--space-4) py-(--space-4)",
          classes?.body,
        )}
      >
        {children}
      </div>

      {footer === undefined ? null : (
        <div
          className={cn(
            "border-hairline shrink-0 border-t px-(--space-4) pt-(--space-4)",
            "pb-[calc(var(--space-4)+env(safe-area-inset-bottom))]",
            classes?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </>
  );

  /**
   * The title block takes focus on open unless the caller wants the first
   * field — announcing the sheet before dropping a person into an input
   * (cross-cutting §3.4).
   */
  const onOpenAutoFocus = React.useCallback(
    (event: Event) => {
      if (initialFocus !== "title") return;
      event.preventDefault();
      titleRef.current?.focus();
    },
    [initialFocus],
  );

  if (isWide) {
    return (
      <Sheet open={open} onOpenChange={requestChange}>
        <SheetContent
          side="right"
          // CC's rule: a header that carries its own action does not also get
          // a corner close, or the sheet has two exits in the same 44px.
          showCloseButton={headerAction === undefined}
          onOpenAutoFocus={onOpenAutoFocus}
          className={cn(
            "flex w-(--sheet-w) max-w-full flex-col gap-0 p-0",
            className,
            classes?.content,
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {subtitle === undefined ? null : (
            <SheetDescription className="sr-only">{subtitle}</SheetDescription>
          )}
          {frame}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={requestChange}>
      <DrawerContent
        className={cn(
          "flex flex-col gap-0 p-0",
          /*
           * The data-variant prefix is required, not cosmetic: `DrawerContent`
           * sets `data-[vaul-drawer-direction=bottom]:max-h-[80vh]`, and a
           * plain `max-h-*` is a different key to tailwind-merge — it survives
           * the merge and then loses on specificity, so `size` would do
           * nothing at all. Matching the prefix makes the override win.
           */
          size === "tall"
            ? "data-[vaul-drawer-direction=bottom]:max-h-[90dvh]"
            : "data-[vaul-drawer-direction=bottom]:max-h-[60dvh]",
          className,
          classes?.content,
        )}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        {subtitle === undefined ? null : (
          <DrawerDescription className="sr-only">{subtitle}</DrawerDescription>
        )}
        {frame}
      </DrawerContent>
    </Drawer>
  );
}
