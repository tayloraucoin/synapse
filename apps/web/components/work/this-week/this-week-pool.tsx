"use client";

import * as React from "react";
import { PlaceSheet, PoolSheet, type PoolPlaceRef } from "../pool-sheet";

/**
 * The pool on This week's day (USE-81): Pool opens USE-79's pool sheet over
 * the day, Place opens USE-80's place sheet over it, its Days starting on
 * the day shown. Placing closes both onto the day, which marks the new row
 * once; the toast with Undo is the placing's own. × on the place sheet comes
 * back to the pool. From 1024 both are ResponsiveSheet's right panel
 * (D-USE-108 (3)).
 */

export interface ThisWeekPoolProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The day shown. */
  dateKey: string;
  /** Placed: the item and the days it landed on. */
  onPlaced: (workItemId: string | null, dateKeys: string[]) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function ThisWeekPool({
  open,
  onOpenChange,
  dateKey,
  onPlaced,
  returnFocusRef,
}: ThisWeekPoolProps) {
  const [placing, setPlacing] = React.useState<PoolPlaceRef | null>(null);
  React.useEffect(() => {
    if (!open) setPlacing(null);
  }, [open]);
  return (
    <>
      <PoolSheet
        open={open}
        onOpenChange={onOpenChange}
        dateKey={dateKey}
        onPlace={setPlacing}
        returnFocusRef={returnFocusRef}
      />
      <PlaceSheet
        itemRef={open ? placing : null}
        dateKey={dateKey}
        onClose={() => setPlacing(null)}
        onPlaced={(dates, workItemId) => {
          setPlacing(null);
          onOpenChange(false);
          onPlaced(workItemId ?? null, dates);
        }}
      />
    </>
  );
}
