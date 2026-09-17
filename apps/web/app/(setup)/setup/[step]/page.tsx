import { notFound } from "next/navigation";

import { getServerApi } from "@/lib/trpc/server";

import { SETUP_COPY, SETUP_TOTAL_STEPS } from "../../_components/copy";
import { Step1Shape } from "../../_components/step-1-shape";
import { Step2WorkDays } from "../../_components/step-2-work-days";
import { Step3WorkShape } from "../../_components/step-3-work-shape";
import { Step4Commitments } from "../../_components/step-4-commitments";
import { Step5Wake } from "../../_components/step-5-wake";
import { Step6BeforeTheDay } from "../../_components/step-6-before-the-day";
import { Step7BeforeWork } from "../../_components/step-7-before-work";
import { Step8Landscape } from "../../_components/step-8-landscape";
import { Step9Ranked } from "../../_components/step-9-ranked";
import { Step10Training } from "../../_components/step-10-training";
import { Step11Closing } from "../../_components/step-11-closing";
import { Step12Focuses } from "../../_components/step-12-focuses";
import { Step13Days } from "../../_components/step-13-days";

/**
 * The first-run sequence — UX v1.2 §4, fourteen screens (RUN-8 renumbered
 * v1.1's twelve; screens 1–5 are v1.2's, 6–12 are rebuilt by RUN-9…RUN-11,
 * 13 and 14 by RUN-12 and RUN-13).
 *
 * THE STEP IS THE URL, and the segment is validated: a step outside 1–14 is
 * a 404, because a sequence that renders an empty screen is worse than a
 * 404. Step 14 is a 404 until RUN-13 creates it; step 13 completes first
 * run until then, so the sequence never dead-ends.
 *
 * THE PAGE IS A SERVER COMPONENT and each screen is a client leaf that
 * receives its current values as props, so a pre-filled field renders as
 * value + Change on first paint rather than after a fetch. Screens whose
 * content is a list the person builds (7–10, 12) read their own queries.
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
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > SETUP_TOTAL_STEPS) {
    notFound();
  }
  // RUN-13 creates screen 14 and moves completion there; until then it is not a screen.
  if (stepNumber === 14) notFound();

  const api = await getServerApi();
  const me = await api.user.me();

  switch (stepNumber) {
    case 1:
      return <Step1Shape initialShape={me.scheduleShape} />;
    case 2:
      return <Step2WorkDays initialWorkDays={me.workDays} />;
    case 3: {
      const types = await api.template.list({ includeArchived: false, kind: "work" });
      return (
        <Step3WorkShape
          initialWorkStart={me.workStartTime}
          initialWorkEnd={me.workEndTime}
          initialDirection={me.anchorDirection}
          initialTypes={types}
        />
      );
    }
    case 4: {
      const fixtures = await api.fixture.list();
      return <Step4Commitments initialFixtures={fixtures} />;
    }
    case 5: {
      const types = await api.template.list({ includeArchived: false, kind: "work" });
      return <Step5Wake initialWake={me.usualWakeTime} workStart={me.workStartTime} workTypes={types} />;
    }
    case 6:
      return (
        <Step6BeforeTheDay
          initialPassage={me.orientPassage}
          initialShowLastNight={me.orientShowLastNight}
          initialAskGratitude={me.orientAskGratitude}
        />
      );
    case 7:
      return <Step7BeforeWork initialWake={me.usualWakeTime} initialWorkStart={me.workStartTime} />;
    case 8:
      return <Step8Landscape />;
    case 9:
      return <Step9Ranked />;
    case 10:
      return <Step10Training />;
    case 11:
      return (
        <Step11Closing
          initialLightsOut={me.lightsOutTime}
          initialDevicesOff={me.devicesOffTime}
          initialJournalEnabled={me.journalEnabled}
          initialPrompts={me.journalPrompts}
        />
      );
    case 12:
      return <Step12Focuses initialWorkStart={me.workStartTime} />;
    default:
      return <Step13Days />;
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
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > SETUP_TOTAL_STEPS) {
    return {};
  }
  return { title: SETUP_COPY.progress(stepNumber, SETUP_TOTAL_STEPS) };
}
