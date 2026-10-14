import type { Metadata } from "next";
import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "../_components/tab-header";
import { TODAY_COPY as COPY } from "./_components/copy";
import { NowScreen } from "./_components/now/now-screen";
import { PushCheck } from "./_components/push-check";

export const metadata: Metadata = { title: COPY.title };

/**
 * Today. Below 1024 it is Now (USE-16), on fixtures through `useNow`; the
 * desk's /today is work Today's ticket, so from 1024 it is still the muted
 * placeholder and the push check (USE-1): notifications have nowhere else
 * to be turned on while Settings is legacy.
 */
export default function TodayPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <TabHeader title={<TodayTitle />} />
      <div className="split:hidden">
        <NowScreen />
      </div>
      <ScreenFrame className="hidden flex-col gap-(--space-4) split:flex">
        <Text as="p" variant="body" tone="muted">
          {COPY.placeholder}
        </Text>
        <PushCheck />
      </ScreenFrame>
    </main>
  );
}

/** "Now" on the phone's tab, "Today" at the desk (nav-items.ts): CSS picks, never a width read. */
function TodayTitle() {
  return (
    <>
      <span className="split:hidden">{COPY.phoneTitle}</span>
      <span className="hidden split:inline">{COPY.title}</span>
    </>
  );
}
