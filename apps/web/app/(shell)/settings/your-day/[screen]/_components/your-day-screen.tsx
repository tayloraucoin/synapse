"use client";

import { useRouter } from "next/navigation";

import type { AnchorDirection, FixtureView, JournalPrompt, MorningMode, ScheduleShape, WorkDays } from "@syn/types";

import { Step1Shape } from "@/app/(setup)/_components/step-1-shape";
import { Step3WorkDays } from "@/app/(setup)/_components/step-3-work-days";
import { Step4Commitments } from "@/app/(setup)/_components/step-4-commitments";
import { Step6BeforeTheDay } from "@/app/(setup)/_components/step-6-before-the-day";
import { Step8Landscape } from "@/app/(setup)/_components/step-8-landscape";
import { Step9Ranked } from "@/app/(setup)/_components/step-9-ranked";
import { Step10Training } from "@/app/(setup)/_components/step-10-training";
import { Step11Closing } from "@/app/(setup)/_components/step-11-closing";
import { Step12Focuses } from "@/app/(setup)/_components/step-12-focuses";
import { YourDays } from "@/components/day-builder";
import { settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

import { EachMorningScreen } from "./each-morning-screen";
import { FreeTimeScreen } from "./free-time-screen";

/**
 * One of the first-run screens, `embedded` — UX v1.3 §4.6 (DAY-8), v1.2
 * §4.16: "The first-run screens, without the frame". The screen's own
 * *Save* returns to the list; there is no sequence to continue. *Morning
 * habits* and *Ranked* are v1.2's landscape and ranking screens, embedded,
 * until the builder's own parts replace them. The three retired words
 * (*Work start*, *Work-day types*, *Wake*) and *Before the day* (now *First
 * thing*) redirect in the page and never reach this switch. DAY-12 added
 * *First thing* (B8's screen), *Free-time activities* (B15a and B15b) and
 * *Each morning* (screen 5's mode question alone).
 *
 * A client leaf because *Save* is a callback, and the page above is a
 * Server Component that reads the account once so the screen paints with
 * its values on first render.
 */
export interface YourDayScreenValues {
  scheduleShape: ScheduleShape | null;
  workDays: WorkDays | null;
  workStartTime: string | null;
  workEndTime: string | null;
  anchorDirection: AnchorDirection | null;
  usualWakeTime: string;
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
      return <Step4Commitments initialFixtures={fixtures} embedded onSaved={done} />;
    case "morning-habits":
      return <Step8Landscape embedded onSaved={done} />;
    case "ranked":
      return <Step9Ranked embedded onSaved={done} />;
    case "work-start":
    case "work-day-types":
    case "wake":
    case "before-the-day":
      // Redirected by the page (v1.3 §4.6); DAY-13 removes the keys.
      return null;
    case "free-time":
      return <FreeTimeScreen onSaved={done} />;
    case "each-morning":
      return <EachMorningScreen initialMode={values.morningMode} onSaved={done} />;
    case "first-thing":
      // B8's screen — passages, links, the quote, the three lines (v1.3 §4.6; DAY-12).
      return (
        <Step6BeforeTheDay
          initialQuotesOptIn={values.quotesOptIn}
          initialAskGratitude={values.orientAskGratitude}
          initialAskIntention={values.orientAskIntention}
          initialAskVisualisation={values.orientAskVisualisation}
          embedded
          onSaved={done}
        />
      );
    case "training":
      return <Step10Training embedded onSaved={done} />;
    case "focuses":
      return <Step12Focuses embedded onSaved={done} />;
    case "your-days":
      return <YourDays embedded />;
    case "closing-the-day":
      return (
        <Step11Closing
          initialLightsOut={values.lightsOutTime}
          initialDevicesOff={values.devicesOffTime}
          initialJournalEnabled={values.journalEnabled}
          initialPrompts={values.journalPrompts}
          initialReminderTime={values.journalReminderTime}
          initialReminderEnabled={values.journalReminderEnabled}
          embedded
          onSaved={done}
        />
      );
  }
}
