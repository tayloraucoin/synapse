"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";

/**
 * USE-64's states on `/dev/parts?state=item-<state>`: Now on Taylor's Monday
 * with the Item sheet over it, taken with `&sheet=item&id=` (Meditate, or
 * "Workout: gym" for Swap; `ITEM_SHEET_IDS`). The part names are the Item
 * sheet scenarios' names, so the screen, the sheet host and the sheet read
 * the same `?state=`.
 */
export function ItemSheetPart() {
  return <NowScreen />;
}
