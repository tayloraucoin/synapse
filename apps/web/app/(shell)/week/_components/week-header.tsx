"use client";

import { Button, SegmentedControl, Text } from "@syn/ui";
import type { WeekLens } from "@/lib/data/use-week-view";
import { WEEK_COPY as COPY } from "./copy";

/**
 * The Week's header (USE-72): "Plan the week" in the serif and the range
 * between ‹ and › on one baseline; the lens control and Today at the right.
 * ‹ and › step a week, Today returns to this week [ASSUMPTION: not drawn].
 */
export interface WeekHeaderProps {
  range: string;
  lens: WeekLens;
  onLens: (lens: WeekLens) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekHeader({
  range,
  lens,
  onLens,
  onPrevious,
  onNext,
  onToday,
}: WeekHeaderProps) {
  return (
    <header className="flex items-center gap-(--space-4)">
      <div className="flex min-w-0 flex-1 items-baseline gap-(--space-4)">
        <h1 className="font-serif text-review-title text-ink">{COPY.title}</h1>
        <Text
          as="span"
          variant="body"
          tone="secondary"
          className="flex items-baseline gap-1"
        >
          <StepButton label={COPY.previous} onClick={onPrevious}>
            ‹
          </StepButton>
          {range}
          <StepButton label={COPY.next} onClick={onNext}>
            ›
          </StepButton>
        </Text>
      </div>
      <SegmentedControl<WeekLens>
        label={COPY.lens}
        value={lens}
        onChange={onLens}
        stacked={false}
        options={[
          { value: "priority", label: COPY.priority },
          { value: "time", label: COPY.time },
        ]}
        classes={{
          root: "gap-0",
          label: "sr-only",
          group:
            "w-auto gap-1 rounded-(--radius-control) border-0 bg-fill-muted p-1",
          item: "h-8 flex-none rounded-(--radius-control) bg-transparent px-3 text-muted-foreground hover:bg-transparent has-checked:bg-background has-checked:font-semibold has-checked:text-ink",
        }}
      />
      <Button variant="secondary" size="sm" onClick={onToday}>
        {COPY.today}
      </Button>
    </header>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-(--radius-control) outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}
