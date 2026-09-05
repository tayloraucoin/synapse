/**
 * BottomNav — the compact-layout tab bar: List · Schedule · Review.
 *
 * Word labels only. The Review tab can carry a presence dot when items are
 * waiting, and the dot is never the whole message: `dotLabel` renders
 * visually-hidden text so a screen reader hears "items waiting" rather than
 * nothing (cross-cutting §11).
 *
 * TOKEN BINDINGS
 *   bar     → --paper surface, --hairline top border
 *   active  → --ink       inactive → --text-secondary
 *   dot     → accent-500, the one place the accent appears outside a time mark
 *
 * SAFE AREA: the bar pads itself by `env(safe-area-inset-bottom)`, so the home
 * indicator never sits on a tab.
 *
 * DIMMED: under a sheet's scrim the bar stays visible and stops being tappable
 * (cross-cutting §2.2 — "keeps the sense of place"), which is why `dimmed`
 * also sets `aria-hidden`.
 */
"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../../../lib/cn";
import {
  bottomNavItemVariants,
  type BottomNavItemVariantProps,
} from "./bottom-nav.variants";

export interface BottomNavClasses {
  root?: string;
  list?: string;
  item?: string;
}

const BottomNav = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"nav"> & { classes?: BottomNavClasses }
>(function BottomNav({ className, classes, ...props }, ref) {
  return (
    <nav
      ref={ref}
      data-slot="bottom-nav"
      aria-label="Main"
      className={cn(
        "border-hairline bg-paper fixed inset-x-0 bottom-0 z-30 border-t",
        "pb-[env(safe-area-inset-bottom)]",
        classes?.root,
        className,
      )}
      {...props}
    />
  );
});

const BottomNavList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul"> & { classes?: BottomNavClasses }
>(function BottomNavList({ className, classes, ...props }, ref) {
  return (
    <ul
      ref={ref}
      className={cn(
        "mx-auto flex max-w-lg list-none items-stretch justify-around p-0",
        classes?.list,
        className,
      )}
      {...props}
    />
  );
});

export interface BottomNavItemProps
  extends Omit<React.ComponentProps<"a">, "children">,
    BottomNavItemVariantProps {
  asChild?: boolean;
  classes?: BottomNavClasses;
  children?: React.ReactNode;
  /** A quiet presence mark — the Review tab when items are waiting. */
  dot?: boolean;
  /** What the dot means, for assistive tech. Required whenever `dot` is set. */
  dotLabel?: string;
}

const BottomNavItem = React.forwardRef<HTMLAnchorElement, BottomNavItemProps>(
  function BottomNavItem(
    {
      className,
      classes,
      active,
      dimmed,
      asChild = false,
      dot = false,
      dotLabel,
      children,
      ...props
    },
    ref,
  ) {
    const Comp = asChild ? Slot.Root : "a";

    return (
      <li
        className={cn("flex-1", classes?.item)}
        aria-hidden={dimmed || undefined}
      >
        <Comp
          ref={ref}
          data-slot="bottom-nav-item"
          aria-current={active ? "page" : undefined}
          className={cn(bottomNavItemVariants({ active, dimmed }), className)}
          {...props}
        >
          <span className="inline-flex items-center gap-(--space-1)">
            {children}
            {dot ? (
              <>
                <span
                  aria-hidden="true"
                  className="bg-accent-mark size-1.5 rounded-(--radius-full)"
                />
                <span className="sr-only">{dotLabel}</span>
              </>
            ) : null}
          </span>
        </Comp>
      </li>
    );
  },
);

export { BottomNav, BottomNavList, BottomNavItem };
