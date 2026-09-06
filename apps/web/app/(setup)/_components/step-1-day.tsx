"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { TimeField, TimezoneSelect } from "@syn/ui";
import { TIMEZONE_REGIONS, detectTimezone } from "@syn/constants";

import { setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame } from "./step-frame";

/**
 * FR-01 — the one number the rest of the setup is anchored to.
 *
 * THE ZONE IS SHOWN, NOT HIDDEN. The document says the default is "shown so
 * the default is visible, not hidden": the field exists to be read once and
 * usually left alone, which is why it is a plain select rather than something
 * tucked behind *Advanced*.
 *
 * THE DETECTED ZONE ONLY OVERRIDES AN UNTOUCHED FIELD. `detectTimezone()` is a
 * browser call, so the server renders the stored zone and this swaps in the
 * device's — but only while the person has not chosen one themselves. Without
 * that guard, a deliberate choice would be silently undone on the next render.
 */
export function Step1Day({
  initialWakeTime,
  initialTimezone,
}: {
  initialWakeTime: string;
  initialTimezone: string;
}) {
  const router = useRouter();
  const save = trpc.user.updatePreferences.useMutation();

  const [wakeTime, setWakeTime] = React.useState(initialWakeTime);
  const [timezone, setTimezone] = React.useState(initialTimezone);
  const [error, setError] = React.useState<string | null>(null);
  const touchedZone = React.useRef(false);

  React.useEffect(() => {
    if (touchedZone.current) return;
    const detected = detectTimezone();
    if (detected !== "") setTimezone(detected);
  }, []);

  async function onContinue(): Promise<void> {
    setError(null);
    try {
      await save.mutateAsync({
        usualWakeTime: wakeTime,
        timezone,
        firstRunStep: 2,
      });
    } catch {
      setError(COPY.saveError);
      return;
    }
    // The step was recorded by the save above, so this only navigates —
    // routing through `useStepNavigation` here would write `first_run_step`
    // a second time for one transition.
    router.replace(setupRoute(2));
  }

  return (
    <StepFrame
      step={1}
      heading={COPY.step1Heading}
      body={COPY.step1Body}
      error={error}
      primary={{
        label: COPY.continue,
        onClick: () => void onContinue(),
        busy: save.isPending,
      }}
    >
      <div className="flex flex-col gap-(--space-4)">
        <TimeField
          label={COPY.usualWakeTime}
          value={wakeTime}
          onChange={setWakeTime}
          required
        />
        <TimezoneSelect
          label={COPY.timezone}
          value={timezone}
          zones={TIMEZONE_REGIONS}
          onChange={(next) => {
            touchedZone.current = true;
            setTimezone(next);
          }}
        />
      </div>
    </StepFrame>
  );
}
