"use client";

import { useRouter } from "next/navigation";

import type {
  AnchorDirection,
  FixtureView,
  JournalPrompt,
  ScheduleShape,
  TemplateSummaryView,
  WorkDays,
} from "@syn/types";

import { Step1Shape } from "@/app/(setup)/_components/step-1-shape";
import { Step2WorkDays } from "@/app/(setup)/_components/step-2-work-days";
import { Step3WorkShape, WorkDayTypeCards } from "@/app/(setup)/_components/step-3-work-shape";
import { Step4Commitments } from "@/app/(setup)/_components/step-4-commitments";
import { Step5Wake } from "@/app/(setup)/_components/step-5-wake";
import { Step6BeforeTheDay } from "@/app/(setup)/_components/step-6-before-the-day";
import { Step11Closing } from "@/app/(setup)/_components/step-11-closing";
import { settingsYourDayRoute, type YourDayScreen as ScreenKey } from "@/lib/routes";

/**
 * One of the first-run screens, `embedded` — UX v1.2 §4.16, v1.1 §4.14:
 * "The first-run screens, without the frame". The screen's own *Save*
 * returns to the list; there is no sequence to continue. *Work-day types*
 * (v1.2) mounts screen 3's *No* path's cards without the radio — each card
 * saves itself, so the page has no *Save* of its own.
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
  workTypes,
}: {
  screen: ScreenKey;
  values: YourDayScreenValues;
  fixtures: FixtureView[];
  workTypes: TemplateSummaryView[];
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
        <Step3WorkShape
          initialWorkStart={values.workStartTime}
          initialWorkEnd={values.workEndTime}
          initialDirection={values.anchorDirection}
          initialTypes={workTypes}
          embedded
          onSaved={done}
        />
      );
    case "work-day-types":
      return <WorkDayTypeCards />;
    case "commitments":
      return <Step4Commitments initialFixtures={fixtures} embedded onSaved={done} />;
    case "wake":
      return (
        <Step5Wake
          initialWake={values.usualWakeTime}
          workStart={values.workStartTime}
          workTypes={workTypes}
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
        <Step11Closing
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
