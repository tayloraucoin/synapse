"use client";

import { WeekScreen } from "@/app/(shell)/week/_components/week-screen";

/**
 * USE-72's states on `/dev/parts?state=<scenario>`: the Week under the
 * week scenarios' own names, so the screen reads the same `?state=`.
 */
export function WeekPart() {
  return <WeekScreen />;
}
