"use client";

import * as React from "react";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";
import { FocusSetupCard } from "@/app/(setup)/_components/focus-setup-card";
import { SetupCards } from "@/app/(setup)/_components/setup-cards";

/**
 * Settings → Your day → *Focuses* (UX v1.3 §4.6) — v1.2's screen 12
 * (§4.12; RUN-11), moved here by DAY-13 when the step files were retired.
 *
 * "The focuses and their rough share of the week." One is fine. The
 * focuses as `FocusSetupCard`s: empty, one muted line and *Add a focus* full
 * width; a card appends and opens, unsaved until it is named. The
 * second-work-template row is gone — that is screen 3's (R32). *Continue · n
 * focuses* only navigates.
 */
export function FocusesScreen({ onSaved }: { onSaved?: () => void }) {
  const online = useOnline();
  // Created order (UX v1.3 R65).
  const focuses = trpc.habit.list.useQuery({ includeArchived: false, types: ["deep_work"], order: "created" });
  const rows = React.useMemo(
    () => (focuses.data?.habits ?? []).filter((habit) => habit.type === "deep_work"),
    [focuses.data?.habits],
  );

  return (
    <FactScreen
      step={12}
      heading={COPY.step12Heading}
      body={COPY.step12Body}
      save={null}
      embedded
      onSaved={onSaved}
    >
      <SetupCards
        rows={rows}
        loading={focuses.isLoading}
        addLabel={COPY.addAFocus}
        disabled={!online}
        renderCard={({ habit, added, index }, callbacks) => (
          <FocusSetupCard
            habit={habit}
            first={index === 0}
            initiallyOpen={added}
            onCreated={callbacks.onCreated}
            onRemoved={callbacks.onRemoved}
            onDiscard={callbacks.onDiscard}
          />
        )}
      />
    </FactScreen>
  );
}
