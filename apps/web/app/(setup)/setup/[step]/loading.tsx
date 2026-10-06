import { StepFrameSkeleton } from "@syn/ui";

/**
 * The sequence never blanks (UX v1.3 R63, §2 guardrail 6; DAY-2).
 *
 * The step page is a Server Component that awaits the profile (and, on some
 * steps, a list) before it renders; without this file a tap on *Continue*
 * showed the old screen, then nothing, then the new one (T10.4, T13.1).
 * Next renders this on every navigation into `/setup/[step]` — `replace`
 * included — until the page is ready.
 *
 * IT CANNOT KNOW THE STEP, so it draws the frame's geometry without a
 * number: the caption slot is a skeleton block. It reads no cookie and
 * renders no data. The region is `aria-busy` inside the layout's `main#main`;
 * nothing announces.
 */
export default function SetupStepLoading() {
  return <StepFrameSkeleton body />;
}
