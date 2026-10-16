"use client";

import * as React from "react";
import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";
import { PlaceSheet, type PlaceSheetProps } from "@/components/work/pool-sheet";
import {
  PLACE_SHEET_DATE,
  type PlaceSheetScenarioName,
} from "./scenarios/place-sheet";
import { POOL_SHEET_IDS } from "./scenarios/pool-sheet";

/**
 * USE-80's states on `/dev/parts?state=<name>`, named as their scenarios,
 * until This week's day (USE-81) opens the pool sheet and Place from it: the
 * place sheet for KES-58 with Tue and Wed picked in Primary; the same placed
 * on load, its toast and Undo over the day (the day's new row and fit line
 * are USE-81's); KES-61 on Tue alone, which Tue's Work cannot hold.
 */

const COPY = {
  week: "Monday, 12 October",
  line: "The day beneath is drawn by its own ticket.",
};

const W = POOL_SHEET_IDS.workItems;
const TUE = "2026-10-13";
const WED = "2026-10-14";

const START: Record<
  PlaceSheetScenarioName,
  { workItemId: string; title: string; initial: PlaceSheetProps["initial"] }
> = {
  "place-sheet": {
    workItemId: W.kes58,
    title: "[Booking: reschedule flow]",
    initial: { picked: [TUE, WED], tier: "primary" },
  },
  "placed-undo": {
    workItemId: W.kes58,
    title: "[Booking: reschedule flow]",
    initial: { picked: [TUE, WED], tier: "primary", place: true },
  },
  "doesnt-fit": {
    workItemId: W.kes61,
    title: "[Portal: e2e tests for sign-in]",
    initial: { picked: [TUE], tier: "primary" },
  },
};

export function PlaceSheetPart({ state }: { state: PlaceSheetScenarioName }) {
  const start = START[state];
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <TabHeader title={COPY.week} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.line}
        </Text>
      </ScreenFrame>
      <PlaceSheet
        itemRef={
          open
            ? { kind: "item", workItemId: start.workItemId, title: start.title }
            : null
        }
        dateKey={PLACE_SHEET_DATE}
        onClose={() => setOpen(false)}
        initial={start.initial}
      />
    </>
  );
}
