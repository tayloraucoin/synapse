"use client";

import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";
import { SpreadSheet } from "@/components/work/spread";
import {
  SPREAD_PHONE_ITEM,
  type SpreadPhoneScenarioName,
} from "./scenarios/spread";

/**
 * USE-78's states on `/dev/parts?state=<name>`: Spread's full sheet over
 * This week's day, and its Days and tier page, until the Item sheet's ···
 * and "doesn't fit" (USE-80) open it on a screen. The sheet stays open:
 * × and Spread it close nothing here.
 */

const COPY = {
  week: "Monday, 12 October",
  line: "The day beneath is drawn by its own ticket.",
};

export function SpreadPhonePart({ state }: { state: SpreadPhoneScenarioName }) {
  return (
    <>
      <TabHeader title={COPY.week} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.line}
        </Text>
      </ScreenFrame>
      <SpreadSheet
        workItemId={SPREAD_PHONE_ITEM}
        onClose={() => {}}
        initialStep={state === "spread-days-and-tier" ? "days" : "main"}
      />
    </>
  );
}
