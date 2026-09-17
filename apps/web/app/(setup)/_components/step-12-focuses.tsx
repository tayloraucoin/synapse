"use client";

import * as React from "react";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { FocusSetupCard } from "./focus-setup-card";
import { SetupCards } from "./step-10-training";

/**
 * Screen 12 — What your work is about (UX v1.2 §4.12; RUN-11).
 *
 * "The focuses and their rough share of the week." One is fine. The
 * focuses as `FocusSetupCard`s: empty, one muted line and *Add a focus* full
 * width; a card appends and opens, unsaved until it is named. The
 * second-work-template row is gone — that is screen 3's (R32). *Continue · n
 * focuses* only navigates.
 */
export function Step12Focuses({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const focuses = trpc.habit.list.useQuery({ includeArchived: false, types: ["deep_work"] });
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
      primaryLabel={COPY.continueFocuses(rows.length)}
      embedded={embedded}
      onSaved={onSaved}
    >
      <SetupCards
        rows={rows}
        loading={focuses.isLoading}
        addLabel={COPY.addAFocus}
        disabled={!online}
        renderCard={(habit, draft, callbacks) => (
          <FocusSetupCard
            key={habit?.id ?? `draft-${draft}`}
            habit={habit}
            first={habit === null ? rows.length === 0 && draft === 0 : rows[0]?.id === habit.id}
            initiallyOpen={habit === null}
            onCreated={callbacks.onCreated}
            onRemoved={callbacks.onRemoved}
            onDiscard={callbacks.onDiscard}
          />
        )}
      />
    </FactScreen>
  );
}
