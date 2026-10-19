"use client";

import { useTodayKey } from "@/lib/data/use-morning";
import { dateTitle } from "../../_components/now/copy";

/** Schedule's title: the date, "Monday, 12 October", at every width. */
export function ScheduleTitle() {
  return <>{dateTitle(useTodayKey())}</>;
}
