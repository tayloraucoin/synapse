"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";

/**
 * USE-28's states on `/dev/parts?state=<scenario>`: Now on Taylor's Monday
 * with the To-do sheet over it, taken with `&sheet=todo&id=` (the mechanic,
 * `TODO_SHEET_IDS`). The part names are the To-do sheet scenarios' names, so
 * the screen, the sheet host and the sheet read the same `?state=`.
 */
export function TodoSheetPart() {
  return <NowScreen />;
}
