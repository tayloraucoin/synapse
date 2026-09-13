"use client";

import { useRouter } from "next/navigation";

import type { AnchorDirection, FixtureView, JournalPrompt, ScheduleShape, WorkDays } from "@syn/types";

import { Step1Shape } from "@/app/(setup)/_components/step-1-shape";
import { Step2WorkDays } from "@/app/(setup)/_components/step-2-work-days";
import { Step3WorkStart } from "@/app/(setup)/_components/step-3-work-start";
import { Step4Commitments } from "@/app/(setup)/_components/step-4-commitments";
import { Step5Wake } from "@/app/(setup)/_components/step-5-wake";
import { Step6BeforeTheDay } from "@/app/(setup)/_components/step-6-before-the-day";
import { Step10Closing } from "@/app/(setup)/_components/step-10-closing";
import { settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

/**
 * One of DYN-10's six screens, or DYN-18's *Closing the day*, `embedded` —
 * UX v1.1 §4.14: "The first-run screens, without the frame". The screen's
 * own *Save* returns to the list; there is no sequence to continue.
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
  earliestWakeTime: string | null;
  orientPassage: string | null;
  orientShowLastNight: boolean;
  orientAskGratitude: boolean;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  journalEnabled: boolean;
  journalPrompts: JournalPrompt[];
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
      return <Step2WorkDays initialWorkDays={values.workDays} embedded onSaved={done} />;
    case "work-start":
      return (
        <Step3WorkStart
          initialWorkStart={values.workStartTime}
          initialWorkEnd={values.workEndTime}
          initialDirection={values.anchorDirection}
          embedded
          onSaved={done}
        />
      );
    case "commitments":
      return <Step4Commitments initialFixtures={fixtures} embedded onSaved={done} />;
    case "wake":
      return (
        <Step5Wake
          initialWake={values.usualWakeTime}
          initialEarliest={values.earliestWakeTime}
          workStart={values.workStartTime}
          embedded
          onSaved={done}
        />
      );
    case "before-the-day":
      return (
        <Step6BeforeTheDay
          initialPassage={values.orientPassage}
          initialShowLastNight={values.orientShowLastNight}
          initialAskGratitude={values.orientAskGratitude}
          embedded
          onSaved={done}
        />
      );
    case "closing-the-day":
      return (
        <Step10Closing
          initialLightsOut={values.lightsOutTime}
          initialDevicesOff={values.devicesOffTime}
          initialJournalEnabled={values.journalEnabled}
          initialPrompts={values.journalPrompts}
          embedded
          onSaved={done}
        />
      );
  }
}
