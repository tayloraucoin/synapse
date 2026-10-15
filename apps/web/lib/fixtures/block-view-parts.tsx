"use client";

import { TodayBlockScreen } from "@/app/(shell)/today/block/[id]/_components/today-block-screen";
import { NOW_IDS } from "./scenarios/now-day";

/**
 * USE-48's states on `/dev/parts?state=block-view-<state>`: Block view from
 * the day on Now's Monday, Wellness open. The part names are the block-view
 * scenarios' names, so the screen reads the same `?state=` it does at
 * `/today/block/<Wellness>`. The capture host has no tabs; `current` and
 * `past` show them only in the shell.
 */
export function BlockViewPart() {
  return <TodayBlockScreen blockId={NOW_IDS.blocks.wellness} />;
}
