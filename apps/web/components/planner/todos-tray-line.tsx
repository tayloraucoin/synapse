"use client";

import { cn, CollapseIcon, ExpandIcon, Text } from "@syn/ui";

/**
 * TodosTrayLine — the To-dos tray's trigger row (USE-16, USE-19; D-USE-26).
 * Closed: "To-dos", the first title ellipsised, a chevron down; "To-dos"
 * alone when there is none or the list has not arrived. Open: "To-dos" alone
 * and a chevron up. Never a count. Props only; `TodosTray` holds it.
 */
export interface TodosTrayLineProps {
  label: string;
  first: string | null;
  open?: boolean;
  /** The id of what it opens. */
  controls?: string;
  onToggle?: () => void;
  className?: string;
}

export function TodosTrayLine({
  label,
  first,
  open = false,
  controls,
  onToggle,
  className,
}: TodosTrayLineProps) {
  const Chevron = open ? CollapseIcon : ExpandIcon;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "flex min-h-(--target) w-full cursor-pointer items-center gap-(--space-2) px-(--space-4) text-start",
        "hover:bg-surface transition-colors duration-(--dur-state) ease-(--ease-settle)",
        className,
      )}
    >
      <Text as="span" variant="secondary" weight={600} className="shrink-0">
        {label}
      </Text>
      <Text
        as="span"
        variant="secondary"
        tone="muted"
        truncate
        className="min-w-0 flex-1"
      >
        {open ? null : first}
      </Text>
      <Chevron aria-hidden="true" className="text-text-muted size-4 shrink-0" />
    </button>
  );
}
