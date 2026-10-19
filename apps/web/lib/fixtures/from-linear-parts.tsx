"use client";

import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";
import {
  FromLinearSheet,
  type FromLinearSheetProps,
} from "@/components/work/from-linear";
import { FROM_LINEAR_IDS } from "./scenarios/from-linear";

/**
 * USE-52's states on `/dev/parts?state=<name>`, named as their scenarios,
 * until Set my days' Work block view (USE-50) opens the sheet from its
 * Primary add row: From Linear for Mon 12's Primary, the capture's two
 * ticked, nothing ticked, the Size chip open, a search with no match, and
 * the list loading and failed.
 */

export type FromLinearPartState =
  | "from-linear-by-size"
  | "from-linear"
  | "from-linear-size-filter"
  | "from-linear-no-match"
  | "from-linear-loading"
  | "from-linear-error";

const COPY = {
  work: "Work",
  line: "The screen beneath is drawn by its own ticket.",
};

const START: Record<FromLinearPartState, FromLinearSheetProps["initial"]> = {
  "from-linear-by-size": { ticked: [...FROM_LINEAR_IDS.ticked] },
  "from-linear": undefined,
  "from-linear-size-filter": {
    filters: { sizes: ["small", "medium"] },
    sizeOpen: true,
  },
  "from-linear-no-match": { filters: { query: "quarterly report" } },
  "from-linear-loading": undefined,
  "from-linear-error": undefined,
};

export function FromLinearPart({ state }: { state: FromLinearPartState }) {
  return (
    <>
      <TabHeader title={COPY.work} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.line}
        </Text>
      </ScreenFrame>
      <FromLinearSheet
        open
        onOpenChange={() => {}}
        dateKey={FROM_LINEAR_IDS.monday}
        blockId={FROM_LINEAR_IDS.work}
        tier="primary"
        initial={START[state]}
      />
    </>
  );
}
