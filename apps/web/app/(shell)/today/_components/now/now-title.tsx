"use client";

import { useDayPhase } from "@/lib/data/use-now";
import { useTodayKey } from "@/lib/data/use-morning";
import { TODAY_COPY } from "../copy";
import { dateTitle } from "./copy";

/**
 * The tab's title: "Now" on the phone once the day is live, the date
 * ("Monday, 12 October") before Ready, go (D-USE-5), "Today" at the desk
 * (nav-items.ts). CSS picks the width, never a width read.
 */
export function NowTitle() {
  const dateKey = useTodayKey();
  const phase = useDayPhase(dateKey);
  return (
    <>
      <span className="split:hidden">
        {phase === "before-go" ? dateTitle(dateKey) : TODAY_COPY.phoneTitle}
      </span>
      <span className="hidden split:inline">{TODAY_COPY.title}</span>
    </>
  );
}
