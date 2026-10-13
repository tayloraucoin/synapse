import { cn } from "@syn/ui";
import type { PriorityLevel } from "./view";

/** Urgent red, High yellow, Normal blue, Low grey (D-USE-42). */
const TONE: Record<PriorityLevel, string> = {
  urgent: "text-alert",
  high: "text-category-yellow-dot",
  normal: "text-category-sky-dot",
  low: "text-category-slate-dot",
};

/** How many of the three bars are lit. */
const BARS: Record<Exclude<PriorityLevel, "urgent">, number> = {
  high: 3,
  normal: 2,
  low: 1,
};

function PriorityGlyph({ level }: { level: PriorityLevel }) {
  if (level === "urgent")
    return (
      <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0">
        <rect width="12" height="12" rx="2" fill="currentColor" />
        <path
          d="M6 2.75v4"
          className="stroke-background"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="6" cy="9.1" r="0.9" className="fill-background" />
      </svg>
    );
  const lit = BARS[level];
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1 + i * 4}
          y={8 - i * 3}
          width="2.5"
          height={3 + i * 3}
          rx="0.6"
          fill="currentColor"
          opacity={i < lit ? 1 : 0.3}
        />
      ))}
    </svg>
  );
}

/** A priority chip: the glyph always with its word (D-USE-42, P-A03). */
export function PriorityChip({
  level,
  word,
}: {
  level: PriorityLevel;
  word: string;
}) {
  return (
    <span
      data-priority={level}
      className="border-border inline-flex h-5 shrink-0 items-center gap-(--space-1) rounded-(--radius-control) border px-1.5 text-(length:--fs-caption) leading-none"
    >
      <span className={cn("inline-flex", TONE[level])}>
        <PriorityGlyph level={level} />
      </span>
      <span className="text-foreground">{word}</span>
    </span>
  );
}
