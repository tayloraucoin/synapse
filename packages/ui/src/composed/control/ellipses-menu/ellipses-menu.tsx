/**
 * EllipsesMenu — the row's overflow actions (v2 handoff §5.5, reuse CC).
 *
 * CC's component, re-skinned to Synapse tokens and with the `destructive`
 * variant dropped: official spec §9.3 permits the destructive token in exactly
 * one place (Delete account, ST-10a), and that surface is a
 * `TypedConfirmDialog`, not a menu row. A menu item that could turn red would
 * be a second place.
 *
 * WHY stopPropagation ON THE TRIGGER: the menu sits *inside* a `ListRow` whose
 * whole surface is a link. Without it, opening the menu also navigates. CC
 * learned this; the handoff's §5.5 note ("a trailing EllipsesMenu outside the
 * link so the row and the menu are separate focusables") is the structural
 * half, and this is the event half.
 */
"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../primitives/feedback/dropdown-menu";

export interface EllipsesMenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  /** Rows the current state does not offer are hidden, not disabled. */
  hidden?: boolean;
}

export interface EllipsesMenuProps {
  items: readonly EllipsesMenuItem[];
  /** Accessible name for the trigger — always name the thing it acts on. */
  label: string;
  menuLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function EllipsesMenu({
  items,
  label,
  menuLabel,
  disabled = false,
  className,
}: EllipsesMenuProps) {
  const visible = items.filter((item) => item.hidden !== true);
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "inline-flex size-(--target) shrink-0 items-center justify-center",
          "rounded-(--radius) text-text-secondary outline-none",
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "hover:bg-surface hover:text-ink",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          className,
        )}
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {menuLabel === undefined ? null : (
          <>
            <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {visible.map((item, index) => {
          const key = `${item.label}-${index}`;

          if (item.href !== undefined && item.disabled !== true) {
            return (
              <DropdownMenuItem key={key} asChild>
                <Link
                  href={item.href}
                  onClick={(event) => event.stopPropagation()}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={key}
              disabled={item.disabled}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                item.onClick?.();
              }}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
