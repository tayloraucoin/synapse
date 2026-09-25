import { notFound, redirect } from "next/navigation";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import {
  RETIRED_YOUR_DAY_SCREENS,
  YOUR_DAY_SCREENS,
  settingsYourDayRoute,
  settingsYourDayScreenRoute,
  type YourDayScreen as ScreenKey,
} from "@/lib/routes";

import { YOUR_DAY_COPY } from "../_components/copy";
import { YourDayScreen } from "./_components/your-day-screen";

/**
 * `/settings/your-day/{screen}` — one of the first run's screens or the
 * builder's lists, embedded (UX v1.3 §4.6; DAY-8). The segment is one of the
 * listed words; anything else is a 404. The block-kind rows live under
 * `block/{kind}` and *Block order* under `order`, so they never reach this
 * route.
 *
 * THE THREE RETIRED WORDS REDIRECT to *Your days* — *Work start*, *Work-day
 * types* and *Wake* are parts of each day plan under v1.3, and a bookmark or
 * a back-stack entry should land somewhere true rather than on a 404. DAY-13
 * removes the keys.
 */
const TITLES: Record<ScreenKey, string> = {
  shape: YOUR_DAY_COPY.rows.shape,
  "work-days": YOUR_DAY_COPY.rows.workDays,
  "your-days": YOUR_DAY_COPY.rows.yourDays,
  "first-thing": YOUR_DAY_COPY.rows.firstThing,
  "morning-habits": YOUR_DAY_COPY.rows.morningHabits,
  ranked: YOUR_DAY_COPY.rows.ranked,
  "free-time": YOUR_DAY_COPY.rows.freeTime,
  training: YOUR_DAY_COPY.rows.training,
  commitments: YOUR_DAY_COPY.rows.commitments,
  "closing-the-day": YOUR_DAY_COPY.rows.closingTheDay,
  focuses: YOUR_DAY_COPY.rows.focuses,
  "each-morning": YOUR_DAY_COPY.rows.eachMorning,
  "before-the-day": YOUR_DAY_COPY.rows.firstThing,
  "work-start": YOUR_DAY_COPY.rows.workStart,
  "work-day-types": YOUR_DAY_COPY.rows.workDayTypes,
  wake: YOUR_DAY_COPY.rows.wake,
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
  if (RETIRED_YOUR_DAY_SCREENS.includes(screen)) redirect(settingsYourDayScreenRoute("your-days"));
  // v1.3 §4.6 (DAY-12): *Before the day* became *First thing* (links joined it); DAY-13 removes the key.
  if (screen === "before-the-day") redirect(settingsYourDayScreenRoute("first-thing"));

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
          quotesOptIn: me.quotesOptIn,
          orientAskGratitude: me.orientAskGratitude,
          orientAskIntention: me.orientAskIntention,
          orientAskVisualisation: me.orientAskVisualisation,
          lightsOutTime: me.lightsOutTime,
          devicesOffTime: me.devicesOffTime,
          journalEnabled: me.journalEnabled,
          journalPrompts: me.journalPrompts,
          journalReminderTime: me.journalReminderTime,
          journalReminderEnabled: me.journalReminderEnabled,
          morningMode: me.morningMode,
        }}
        fixtures={fixtures}
      />
    </PageFrame>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  return isScreen(screen) && !RETIRED_YOUR_DAY_SCREENS.includes(screen) && screen !== "before-the-day"
    ? { title: TITLES[screen] }
    : {};
}
