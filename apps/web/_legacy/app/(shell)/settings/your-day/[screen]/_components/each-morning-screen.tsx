"use client";

import * as React from "react";

import type { MorningMode } from "@syn/types";
import { LargeTargetRow } from "@syn/ui";

import { SETUP_COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

/**
 * Settings → Your day → *Each morning* — UX v1.3 §4.6 (DAY-12): screen 5's
 * mode question alone. *Save* writes `morning_mode` and nothing else — no
 * completion, no week pre-fill; tomorrow morning follows the new answer.
 */
export function EachMorningScreen({ initialMode, onSaved }: { initialMode: MorningMode; onSaved: () => void }) {
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const [mode, setMode] = React.useState<MorningMode>(initialMode);

  return (
    <FactScreen
      step={5}
      heading={SETUP_COPY.morningMode}
      save={async () => {
        await save.mutateAsync({ morningMode: mode });
      }}
      embedded
      onSaved={onSaved}
    >
      <LargeTargetRow
        label={SETUP_COPY.morningMode}
        layout="stacked"
        value={mode}
        disabled={!online}
        onChange={(value) => setMode(value as MorningMode)}
        options={[
          { value: "set_from_plan", label: SETUP_COPY.setFromPlan, description: SETUP_COPY.setFromPlanBody },
          { value: "build_each_morning", label: SETUP_COPY.buildEachMorning, description: SETUP_COPY.buildEachMorningBody },
        ]}
        className="[&>span:first-child]:sr-only"
      />
    </FactScreen>
  );
}
