"use client";

import { DaysScreen } from "@/app/(shell)/days/_components/days-screen";

/**
 * USE-39's states on `/dev/parts?state=<scenario>`: Set my days under its
 * scenarios' own names, opening on the week and day each frame starts at.
 */
export function DaysPart() {
  return <DaysScreen />;
}
