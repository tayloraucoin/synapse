import { cn } from "@syn/ui";

/**
 * DueBadge — "Due Thu", "Due tomorrow", "Due today" (USE-72, D-USE-98): the
 * words in warning on the warning fill from two days before, in
 * destructive-text on its fill on the day and after. The word carries the
 * meaning; the colour never stands alone. Props only: the screen's hook
 * works the badge out for its column.
 */
export interface DueBadgeProps {
  word: string;
  tone: "warning" | "danger";
  className?: string;
}

export function DueBadge({ word, tone, className }: DueBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-4.5 shrink-0 items-center rounded-(--radius-control) px-1.5",
        "text-(length:--fs-caption) leading-(--lh-caption) font-semibold whitespace-nowrap",
        tone === "warning"
          ? "bg-warning-fill text-warning-text"
          : "bg-destructive-fill text-destructive-text",
        className,
      )}
    >
      {word}
    </span>
  );
}
