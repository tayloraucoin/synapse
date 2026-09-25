import { notFound } from "next/navigation";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import { YOUR_DAY_SCREENS, settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

import { YOUR_DAY_COPY } from "../_components/copy";
import { YourDayScreen } from "./_components/your-day-screen";

/**
 * `/settings/your-day/{screen}` — one of the first run's screens or the
 * builder's lists, embedded (UX v1.3 §4.6; DAY-8). The segment is one of the
 * listed words; anything else is a 404. The block-kind rows live under
 * `block/{kind}` and *Block order* under `order`, so they never reach this
 * route. The words v1.3 retired (DAY-8 and DAY-12 redirected them) are gone
 * since DAY-13, and 404 like any other.
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
  return isScreen(screen) ? { title: TITLES[screen] } : {};
}
