import { notFound, redirect } from "next/navigation";

import { setupRoute } from "@/lib/routes";
import { getServerApi } from "@/lib/trpc/server";

import { SETUP_COPY } from "../../_components/copy";
import { Step1Day } from "../../_components/step-1-day";
import { Step2Habits } from "../../_components/step-2-habits";
import { Step3Template } from "../../_components/step-3-template";
import { Step4Week } from "../../_components/step-4-week";
import { Step5Ready } from "../../_components/step-5-ready";
import { targetWeekFor } from "../../_components/target-week";

/**
 * FR-01…05 — the first-run sequence.
 *
 * THE STEP IS THE URL, and the segment is validated: `/setup/6` is not a step,
 * and a sequence that renders an empty sixth screen is worse than a 404.
 *
 * THE PAGE IS A SERVER COMPONENT and each step is a client leaf that receives
 * its initial data as props. Reading the account here means the out-of-order
 * redirects happen before anything renders, rather than as a flash of the
 * wrong step followed by a client-side bounce.
 *
 * IT DOES NOT GATE ON `first_run_completed_at`. Someone who finished setup and
 * types `/setup/3` gets step 3 — allowed and harmless, because everything in
 * the sequence is editable later anyway, and a redirect would be the product
 * refusing to show a screen it has no reason to hide.
 */
export default async function SetupStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 5) {
    notFound();
  }

  const api = await getServerApi();
  const me = await api.user.me();

  if (stepNumber === 1) {
    return (
      <Step1Day
        initialWakeTime={me.usualWakeTime}
        initialTimezone={me.timezone}
      />
    );
  }

  if (stepNumber === 2) {
    return <Step2Habits />;
  }

  // Steps 3 and 4 are about habits and the templates built from them. With no
  // habits there is nothing to put in either, which is why FR-02 sends an
  // empty library straight to FR-05 — and why arriving here directly goes back
  // to the step that would have made the difference.
  const habits = await api.habit.list({ includeArchived: false });
  const habitCount = habits.habits.length;

  if (stepNumber === 3) {
    if (habitCount === 0) redirect(setupRoute(2));
    return <Step3Template />;
  }

  const { todayKey } = await api.day.today();
  const targetWeek = targetWeekFor(todayKey);

  if (stepNumber === 4) {
    if (habitCount === 0) redirect(setupRoute(2));
    return <Step4Week weekKey={targetWeek} />;
  }

  const week = await api.week.get({ week: targetWeek });
  const plannedDays = week.days.filter(
    (day) => day.templateId !== null,
  ).length;

  return <Step5Ready plannedDays={plannedDays} habitCount={habitCount} />;
}

/**
 * The document title is the progress label (Epic 1 §2), so a browser tab and a
 * screen reader's window announcement both say which step this is.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const stepNumber = Number(step);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 5) {
    return {};
  }
  return { title: SETUP_COPY.progress(stepNumber) };
}
