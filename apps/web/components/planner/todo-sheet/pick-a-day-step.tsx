"use client";

import * as React from "react";
import { BackIcon, Button, MonthGrid, Text } from "@syn/ui";

/**
 * PickADayStep (USE-29; D-USE-69): Pick a day's month as a step inside the
 * To-do sheet, never a second sheet, back on the left. Give it a day… and
 * the At row's Pick a day… open it with their own title; one tap on a day
 * picks it and the sheet returns. Past days are closed (`minDate` today).
 * The month is `@syn/ui`'s `MonthGrid`, which Move to's Pick a day reuses
 * with its marks; none are passed here.
 */
export interface PickADayStepProps {
  /** "Give it a day", "Remind on". */
  title: string;
  /** The sheet it returns to, as the back link reads: the to-do's title. */
  backLabel: string;
  /** The day already set, filled; null for none. */
  value: string | null;
  todayKey: string;
  onPick: (dateKey: string) => void;
  onBack: () => void;
}

export function PickADayStep({
  title,
  backLabel,
  value,
  todayKey,
  onPick,
  onBack,
}: PickADayStepProps) {
  // Opens on the day set when it is still ahead, else on this month.
  const [month, setMonth] = React.useState(
    (value !== null && value >= todayKey ? value : todayKey).slice(0, 7),
  );
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label={`Back to ${backLabel}`}
          className="-ms-(--space-3) gap-(--space-1) self-start"
        >
          <BackIcon aria-hidden="true" className="size-4" />
          {backLabel}
        </Button>
        <Text
          as="h2"
          variant="heading"
          ref={titleRef}
          tabIndex={-1}
          className="outline-none"
        >
          {title}
        </Text>
      </div>
      <MonthGrid
        month={month}
        today={todayKey}
        picked={value}
        minDate={todayKey}
        onMonth={setMonth}
        onPick={onPick}
      />
    </div>
  );
}
