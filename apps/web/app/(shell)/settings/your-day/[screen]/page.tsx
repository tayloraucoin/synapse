import { notFound } from "next/navigation";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import { YOUR_DAY_SCREENS, settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

import { YOUR_DAY_COPY } from "../_components/copy";
import { YourDayScreen } from "./_components/your-day-screen";

/**
 * `/settings/your-day/{screen}` — one of DYN-10's six screens, or DYN-18's
 * *Closing the day* (screen 10), embedded (UX v1.1 §4.14). The segment is
 * one of seven words; anything else is a 404. The block-kind rows live under
 * `block/{kind}` and *Block order* under `order`, so they never reach this
 * route.
 */
const TITLES: Record<ScreenKey, string> = {
  shape: YOUR_DAY_COPY.rows.shape,
  "work-days": YOUR_DAY_COPY.rows.workDays,
  "work-start": YOUR_DAY_COPY.rows.workStart,
  commitments: YOUR_DAY_COPY.rows.commitments,
  wake: YOUR_DAY_COPY.rows.wake,
  "before-the-day": YOUR_DAY_COPY.rows.beforeTheDay,
  "closing-the-day": YOUR_DAY_COPY.rows.closingTheDay,
};

function isScreen(value: string): value is ScreenKey {
  return (YOUR_DAY_SCREENS as readonly string[]).includes(value);
}

export default async function SettingsYourDayScreenPage({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!isScreen(screen)) notFound();

  const api = await getServerApi();
  const me = await api.user.me();
  const fixtures = screen === "commitments" ? await api.fixture.list() : [];

  return (
    <PageFrame
      header={<ShellPageHeader title={TITLES[screen]} showBack backFallback={settingsYourDayRoute()} />}
      contentWidth="text"
    >
      <YourDayScreen
        screen={screen}
        values={{
          scheduleShape: me.scheduleShape,
          workDays: me.workDays,
          workStartTime: me.workStartTime,
          workEndTime: me.workEndTime,
          anchorDirection: me.anchorDirection,
          usualWakeTime: me.usualWakeTime,
          earliestWakeTime: me.earliestWakeTime,
          orientPassage: me.orientPassage,
          orientShowLastNight: me.orientShowLastNight,
          orientAskGratitude: me.orientAskGratitude,
          lightsOutTime: me.lightsOutTime,
          devicesOffTime: me.devicesOffTime,
          journalEnabled: me.journalEnabled,
          journalPrompts: me.journalPrompts,
        }}
        fixtures={fixtures}
      />
    </PageFrame>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  return isScreen(screen) ? { title: TITLES[screen] } : {};
}
