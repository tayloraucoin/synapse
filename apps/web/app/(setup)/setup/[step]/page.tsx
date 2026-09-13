import { notFound } from "next/navigation";

import { getServerApi } from "@/lib/trpc/server";

import { SETUP_COPY, SETUP_LAST_BUILT_STEP, SETUP_TOTAL_STEPS } from "../../_components/copy";
import { Step1Shape } from "../../_components/step-1-shape";
import { Step2WorkDays } from "../../_components/step-2-work-days";
import { Step3WorkStart } from "../../_components/step-3-work-start";
import { Step4Commitments } from "../../_components/step-4-commitments";
import { Step5Wake } from "../../_components/step-5-wake";
import { Step6BeforeTheDay } from "../../_components/step-6-before-the-day";
import { Step7Ready } from "../../_components/step-7-ready";

/**
 * The first-run sequence — UX v1.1 §4, screens 1–6 (DYN-10) and the
 * transitional ready at 7 until DYN-11 lands 7–12.
 *
 * THE STEP IS THE URL, and the segment is validated: a step above the last
 * built one is a 404, because a sequence that renders an empty screen is
 * worse than a 404.
 *
 * THE PAGE IS A SERVER COMPONENT and each screen is a client leaf that
 * receives its current values as props, so a pre-filled field renders as
 * value + Change on first paint rather than after a fetch.
 *
 * IT DOES NOT GATE ON `first_run_completed_at`. Someone who finished setup
 * and types `/setup/3` gets screen 3 — everything in the sequence is editable
 * later anyway (Settings → Your day), and a redirect would be the product
 * refusing to show a screen it has no reason to hide.
 */
export default async function SetupStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (
    !Number.isInteger(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > SETUP_LAST_BUILT_STEP
  ) {
    notFound();
  }

  const api = await getServerApi();
  const me = await api.user.me();

  switch (stepNumber) {
    case 1:
      return <Step1Shape initialShape={me.scheduleShape} />;
    case 2:
      return <Step2WorkDays initialWorkDays={me.workDays} />;
    case 3:
      return (
        <Step3WorkStart
          initialWorkStart={me.workStartTime}
          initialWorkEnd={me.workEndTime}
          initialDirection={me.anchorDirection}
        />
      );
    case 4: {
      const fixtures = await api.fixture.list();
      return <Step4Commitments initialFixtures={fixtures} />;
    }
    case 5:
      return (
        <Step5Wake
          initialWake={me.usualWakeTime}
          initialEarliest={me.earliestWakeTime}
          workStart={me.workStartTime}
        />
      );
    case 6:
      return (
        <Step6BeforeTheDay
          initialPassage={me.orientPassage}
          initialShowLastNight={me.orientShowLastNight}
          initialAskGratitude={me.orientAskGratitude}
        />
      );
    default:
      return <Step7Ready />;
  }
}

/**
 * The document title is the progress label (§4), so a browser tab and a
 * screen reader's window announcement both say which step this is.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (
    !Number.isInteger(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > SETUP_LAST_BUILT_STEP
  ) {
    return {};
  }
  return { title: SETUP_COPY.progress(stepNumber, SETUP_TOTAL_STEPS) };
}
