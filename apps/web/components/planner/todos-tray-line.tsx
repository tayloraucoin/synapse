"use client";

import { cn, ExpandIcon, Text } from "@syn/ui";

/**
 * TodosTrayLine — the To-dos tray, closed (USE-16; D-USE-26): "To-dos" and
 * the first title, ellipsised, and a chevron, between hairlines. "To-dos"
 * alone when there is none. A toggle; USE-19 opens it. Props only.
 */
export interface TodosTrayLineProps {
  label: string;
  first: string | null;
  onToggle?: () => void;
  className?: string;
}

export function TodosTrayLine({
  label,
  first,
  onToggle,
  className,
}: TodosTrayLineProps) {
  return (
    <button
      type="button"
      aria-expanded={false}
      onClick={onToggle}
      className={cn(
        "border-hairline flex min-h-(--target) w-full cursor-pointer items-center gap-(--space-2) border-y px-(--space-4) text-start",
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
        {first}
      </Text>
      <ExpandIcon
        aria-hidden="true"
        className="text-text-muted size-4 shrink-0"
      />
    </button>
  );
}
