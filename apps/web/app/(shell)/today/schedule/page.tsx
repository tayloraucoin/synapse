import type { Metadata } from "next";
import { TabHeader } from "../../_components/tab-header";
import { SCHEDULE_COPY as COPY } from "./_components/copy";
import { ScheduleScreen } from "./_components/schedule-screen";
import { ScheduleTitle } from "./_components/schedule-title";

export const metadata: Metadata = { title: COPY.title };

/**
 * `/today/schedule`: Schedule (USE-27; day/schedule/), on fixtures through
 * `useSchedule` until the day-records wiring. The date is the page's title;
 * the day column scrolls under the tray, so the page is the viewport's
 * height less the tabs (the rail's, from 1024).
 *
 * Not in the day's entry tree: the tab is there before Ready, go too, the
 * same column without the edge (D-USE-77).
 */
export default function SchedulePage() {
  return (
    <main
      id="main"
      className="flex h-[calc(100dvh-var(--tabbar-h)-env(safe-area-inset-bottom))] flex-col split:h-dvh"
    >
      <TabHeader title={<ScheduleTitle />} />
      <ScheduleScreen />
    </main>
  );
}
