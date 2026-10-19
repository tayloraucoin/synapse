"use client";

import { DaysBlockScreen } from "@/app/(shell)/days/block/[id]/_components/days-block-screen";
import { TodayBlockScreen } from "@/app/(shell)/today/block/[id]/_components/today-block-screen";
import { BLOCK_EDIT_PATHS } from "./scenarios/block-view-editing";
import { BLOCK_WORK_TODOS_PATHS } from "./scenarios/block-view-work-todos";
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

/**
 * USE-50's states on `/dev/parts?state=block-view-<state>`: Block view in
 * editing on This week, the block and date its `BLOCK_WORK_TODOS_PATHS`
 * path names (the part's URL carries only `?state=`).
 */
export function BlockEditPart({
  state,
}: {
  state: keyof typeof BLOCK_WORK_TODOS_PATHS;
}) {
  const [path = "", query = ""] = BLOCK_WORK_TODOS_PATHS[state].split("?");
  const blockId = decodeURIComponent(path.split("/").at(-1) ?? "");
  return <DaysBlockScreen blockId={blockId} at={query} />;
}

/**
 * USE-49's Set-my-days editing states on `/dev/parts?state=block-view-<state>`:
 * Block view in editing, the block and weekday or date its `BLOCK_EDIT_PATHS`
 * path names, so it renders as `/days/block/<id>` does without the sign-in.
 */
export function BlockSetDaysEditPart({
  state,
}: {
  state: keyof typeof BLOCK_EDIT_PATHS;
}) {
  const [path = "", query = ""] = BLOCK_EDIT_PATHS[state].split("?");
  const blockId = decodeURIComponent(path.split("/").at(-1) ?? "");
  return <DaysBlockScreen blockId={blockId} at={query} />;
}
