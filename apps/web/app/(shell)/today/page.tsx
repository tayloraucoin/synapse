import { Suspense } from "react";
import type { Metadata } from "next";
import { Text } from "@syn/ui";
import { DayEntryGate } from "../_components/day-entry-gate";
import { TabHeader } from "../_components/tab-header";
import { TODAY_COPY as COPY } from "./_components/copy";
import { TodayDesk } from "./_components/desk/today-desk";
import { NowScreen } from "./_components/now/now-screen";
import { NowTitle } from "./_components/now/now-title";
import { PushCheck } from "./_components/push-check";

export const metadata: Metadata = { title: COPY.title };

/**
 * Today. Below 1024 it is Now (USE-16, USE-17), on fixtures through
 * `useNow`, or the day's List before Ready, go; the
 * desk's /today is the week strip over the main column and the day column
 * (USE-58), the main column still the muted placeholder and the push check
 * (USE-1) until work Today's ticket fills it; `?date=` opens another date
 * there, planning. The strip stands where the desk's header was, so the tab
 * header is the phone's alone [ASSUMPTION: as drawn].
 *
 * It is Now in the day's entry tree (USE-12): a day not yet oriented goes to
 * Orient, one before Ready, go to Review the day, one before Start to the
 * welcome.
 */
export default function TodayPage() {
  return (
    <DayEntryGate here="now">
      <main id="main" className="flex flex-1 flex-col">
        <div className="split:hidden">
          <TabHeader title={<NowTitle />} />
          <NowScreen />
        </div>
        <div className="hidden split:block">
          <Suspense>
            <TodayDesk
              main={
                <div className="flex flex-col gap-(--space-4)">
                  <Text as="p" variant="body" tone="muted">
                    {COPY.placeholder}
                  </Text>
                  <PushCheck />
                </div>
              }
            />
          </Suspense>
        </div>
      </main>
    </DayEntryGate>
  );
}
