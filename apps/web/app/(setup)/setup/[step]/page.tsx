import { notFound } from "next/navigation";

import { getServerApi } from "@/lib/trpc/server";

import { SETUP_COPY, SETUP_TOTAL_STEPS } from "../../_components/copy";
import { Step1Shape } from "../../_components/step-1-shape";
import { Step2Blocks } from "../../_components/step-2-blocks";
import { Step3WorkDays } from "../../_components/step-3-work-days";
import { Step4Days } from "../../_components/step-4-days";
import { Step5Week } from "../../_components/step-5-week";

/**
 * The first-run sequence — UX v1.3 §4 (R45, TD-31; DAY-8), five screens:
 * the shape of the week; the blocks primer; which days are work; your days
 * (the builder, v1.2's nine screens until DAY-9…DAY-11); your week, which
 * completes first run (RUN-13). v1.2's other step files stay on disk,
 * unrouted, until DAY-13 — Settings → Your day still mounts some of them.
 *
 * THE STEP IS THE URL, and the segment is validated: a step outside 1–5 is
 * a 404, because a sequence that renders an empty screen is worse than a
 * 404. An account stored mid-v1.2 (a step above 5) is resumed at 4 by the
 * entry tree's clamp, never sent here.
 *
 * THE PAGE IS A SERVER COMPONENT and each screen is a client leaf that
 * receives its current values as props, so a pre-filled field renders as
 * value + Change on first paint rather than after a fetch. Screen 2 renders
 * from constants; screen 4's list reads its own queries.
 *
 * IT DOES NOT GATE ON `first_run_completed_at`. Someone who finished setup
 * and types `/setup/3` gets screen 3 — everything in the sequence is editable
 * later anyway (Settings → Your day), and a redirect would be the product
 * refusing to show a screen it has no reason to hide.
 */
export default async function SetupStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const { step } = await params;
  const { edit } = await searchParams;
  const stepNumber = Number(step);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > SETUP_TOTAL_STEPS) {
    notFound();
  }

  const api = await getServerApi();
  const me = await api.user.me();

  switch (stepNumber) {
    case 1:
      return <Step1Shape initialShape={me.scheduleShape} />;
    case 2:
      return <Step2Blocks />;
    case 3:
      return <Step3WorkDays initialWorkDays={me.workDays} />;
    case 4:
      return <Step4Days editPlanId={typeof edit === "string" && edit !== "" ? edit : null} />;
    default:
      return <Step5Week initialWorkDays={me.workDays} initialMode={me.morningMode} />;
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
