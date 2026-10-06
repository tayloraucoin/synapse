"use client";

import { useRouter } from "next/navigation";

import type { FixtureView, JournalPrompt, MorningMode, ScheduleShape, WorkDays } from "@syn/types";

import { Step1Shape } from "@/app/(setup)/_components/step-1-shape";
import { Step3WorkDays } from "@/app/(setup)/_components/step-3-work-days";
import { FirstThing, MorningLandscape, MorningRanked, YourDays } from "@/components/day-builder";
import { settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

import { ClosingScreen } from "./closing-screen";
import { CommitmentsScreen } from "./commitments-screen";
import { EachMorningScreen } from "./each-morning-screen";
import { FocusesScreen } from "./focuses-screen";
import { FreeTimeScreen } from "./free-time-screen";
import { TrainingScreen } from "./training-screen";

/**
 * One of the first-run screens, `embedded` — UX v1.3 §4.6 (DAY-8), v1.2
 * §4.16: "The first-run screens, without the frame". The screen's own
 * *Save* returns to the list; there is no sequence to continue. *First
 * thing*, *Morning habits* and *Ranked* are the builder's B8–B10 bodies,
 * embedded; *Training*, *Commitments*, *Closing the day* and *Focuses* live
 * beside this file — DAY-13 moved them there and retired the step files,
 * and with them the four retired keys.
 *
 * A client leaf because *Save* is a callback, and the page above is a
 * Server Component that reads the account once so the screen paints with
 * its values on first render.
 */
export interface YourDayScreenValues {
  scheduleShape: ScheduleShape | null;
  workDays: WorkDays | null;
  quotesOptIn: boolean;
  orientAskGratitude: boolean;
  orientAskIntention: boolean;
  orientAskVisualisation: boolean;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  journalEnabled: boolean;
  journalPrompts: JournalPrompt[];
  journalReminderTime: string | null;
  journalReminderEnabled: boolean;
  morningMode: MorningMode;
}

export function YourDayScreen({
  screen,
  values,
  fixtures,
}: {
  screen: ScreenKey;
  values: YourDayScreenValues;
  fixtures: FixtureView[];
}) {
  const router = useRouter();
  const done = () => {
    router.push(settingsYourDayRoute());
  };

  switch (screen) {
    case "shape":
      return <Step1Shape initialShape={values.scheduleShape} embedded onSaved={done} />;
    case "work-days":
      return <Step3WorkDays initialWorkDays={values.workDays} embedded onSaved={done} />;
    case "commitments":
      return <CommitmentsScreen initialFixtures={fixtures} onSaved={done} />;
    case "morning-habits":
      return <MorningLandscape embedded onSaved={done} />;
    case "ranked":
      return <MorningRanked embedded onSaved={done} />;
    case "free-time":
      return <FreeTimeScreen onSaved={done} />;
    case "each-morning":
      return <EachMorningScreen initialMode={values.morningMode} onSaved={done} />;
    case "first-thing":
      // B8's screen — passages, links, the quote, the three lines (v1.3 §4.6; DAY-12).
      return (
        <FirstThing
          initialQuotesOptIn={values.quotesOptIn}
          initialAskGratitude={values.orientAskGratitude}
          initialAskIntention={values.orientAskIntention}
          initialAskVisualisation={values.orientAskVisualisation}
          embedded
          onSaved={done}
        />
      );
    case "training":
      return <TrainingScreen onSaved={done} />;
    case "focuses":
      return <FocusesScreen onSaved={done} />;
    case "your-days":
      return <YourDays embedded />;
    case "closing-the-day":
      return (
        <ClosingScreen
          initialLightsOut={values.lightsOutTime}
          initialDevicesOff={values.devicesOffTime}
          initialJournalEnabled={values.journalEnabled}
          initialPrompts={values.journalPrompts}
          initialReminderTime={values.journalReminderTime}
          initialReminderEnabled={values.journalReminderEnabled}
          onSaved={done}
        />
      );
  }
}
