"use client";

import * as React from "react";

import { LargeTargetRow, Text } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";
import { setupRoute } from "@/lib/routes";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { RotationRows } from "./rotation-rows";
import { useStepNavigation } from "./step-frame";

/**
 * Screen 10 — Training (UX v1.1 §4.9; screen 10 under v1.2 §4 — RUN-8 renumbered the sequence to fourteen; RUN-11 rebuilds it).
 *
 * "The rotation: what, how often, usually when, how long." *Not right now*
 * skips ahead and writes nothing; *Yes* shows the rows and makes sure a
 * training template exists, so Settings → Your day → Training has a block
 * to open. Nothing here asks for a time — where it fits is decided each
 * morning (§3.7).
 */
export function Step10Training({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();
  const workouts = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"] });
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "training" });
  const create = trpc.template.create.useMutation();

  const count = (workouts.data?.habits ?? []).filter((habit) => habit.type === "workout").length;
  // An account with workouts already answered yes; otherwise the question stands.
  const [answer, setAnswer] = React.useState<"yes" | "no" | null>(null);
  const trains = answer === "yes" || (answer === null && count > 0) || embedded;

  const ensuring = React.useRef(false);
  React.useEffect(() => {
    if (!trains || !templates.isSuccess || templates.data.length > 0 || ensuring.current) return;
    ensuring.current = true;
    void create.mutateAsync({ kind: "training" }).then(() => utils.template.list.invalidate());
  }, [trains, templates.isSuccess, templates.data, create, utils]);

  return (
    <FactScreen
      step={10}
      heading={COPY.step10Heading}
      save={null}
      primaryLabel={COPY.continueWorkouts(count)}
      embedded={embedded}
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-5)">
        {embedded ? null : (
          <LargeTargetRow
            label={COPY.step10Heading}
            layout="stacked"
            value={trains ? "yes" : answer}
            onChange={(value) => {
              if (value === "no") {
                setAnswer("no");
                void goTo(11, setupRoute(11));
                return;
              }
              setAnswer("yes");
            }}
            options={[
              { value: "yes", label: COPY.trainYes },
              { value: "no", label: COPY.trainNo },
            ]}
          />
        )}

        {trains ? (
          <>
            <RotationRows kind="workout" />
            <Text as="p" variant="caption" tone="secondary">
              {COPY.whereItFits}
            </Text>
          </>
        ) : null}
      </div>
    </FactScreen>
  );
}
