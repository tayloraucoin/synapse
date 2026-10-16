"use client";

import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";
import { PoolSheet, type PoolSheetProps } from "@/components/work/pool-sheet";
import {
  POOL_SHEET_DATE,
  type PoolSheetScenarioName,
} from "./scenarios/pool-sheet";

/**
 * USE-79's states on `/dev/parts?state=<name>`, named as their scenarios,
 * until This week's day (USE-81) opens the pool sheet from its Pool button:
 * the Pool tab, the client filter open, a search for "booking" and one with
 * no match, From Linear, Linear not connected, the empty pool and clients
 * off. Place hands the item to USE-80's place sheet, not built here.
 */

const COPY = {
  week: "Monday, 12 October",
  line: "The day beneath is drawn by its own ticket.",
};

const START: Record<PoolSheetScenarioName, PoolSheetProps["initial"]> = {
  "pool-sheet": undefined,
  "pool-filter": { filterSheet: "client" },
  "pool-search": { query: "booking" },
  "pool-search-none": { query: "quarterly report" },
  "pool-from-linear": { tab: "linear" },
  "pool-sheet-linear-off": { tab: "linear" },
  "pool-sheet-empty": undefined,
  "pool-clients-off": undefined,
};

export function PoolSheetPart({ state }: { state: PoolSheetScenarioName }) {
  return (
    <>
      <TabHeader title={COPY.week} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.line}
        </Text>
      </ScreenFrame>
      <PoolSheet
        open
        onOpenChange={() => {}}
        dateKey={POOL_SHEET_DATE}
        onPlace={() => {}}
        initial={START[state]}
      />
    </>
  );
}
