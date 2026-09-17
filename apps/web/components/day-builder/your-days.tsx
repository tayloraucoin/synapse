"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { DayPlanSummaryView } from "@syn/types";
import { Button, HelperText, LoadingText, Text } from "@syn/ui";

import { StepFrame } from "@/app/(setup)/_components/step-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { todayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { DAY_BUILDER_COPY as COPY } from "./copy";
import { DayBuilder } from "./day-builder";
import { DayPlanCard } from "./day-plan-card";
import type { BuilderScreen } from "./use-day-builder";

/**
 * *Your days* — UX v1.2 §4.13, §4.16 (RUN-12): a card per plan in
 * `sort_order`, *Build another day*, and — in the sequence — *Continue · n
 * days*, which completes first run as RUN-8's placeholder did until RUN-13
 * moves completion to screen 14. Under Settings the same list, embedded,
 * with no primary.
 *
 * FIRST ARRIVAL OPENS THE BUILDER: with no plans, one is created and 13a
 * shows at once — nobody sees an empty list they have to act on. A draft
 * card resumes at the first screen whose part is still missing.
 */
export function YourDays({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();
  const plans = trpc.dayPlan.list.useQuery(undefined);
  const templates = trpc.template.list.useQuery({ includeArchived: false });
  const create = trpc.dayPlan.create.useMutation();
  const duplicate = trpc.dayPlan.duplicate.useMutation();
  const remove = trpc.dayPlan.delete.useMutation();
  const completeFirstRun = trpc.user.completeFirstRun.useMutation();

  const [building, setBuilding] = React.useState<{ planId: string; screen: BuilderScreen } | null>(null);
  const [line, setLine] = React.useState<string | null>(null);
  const [finishing, setFinishing] = React.useState(false);
  const creating = React.useRef(false);

  const refresh = React.useCallback(async () => {
    await Promise.all([utils.dayPlan.list.invalidate(), utils.template.list.invalidate()]);
  }, [utils]);

  const startNew = React.useCallback(async () => {
    if (creating.current) return;
    creating.current = true;
    setLine(null);
    try {
      const made = await create.mutateAsync({});
      await refresh();
      setBuilding({ planId: made.id, screen: "a" });
    } catch {
      setLine(COPY.saveError);
    } finally {
      creating.current = false;
    }
  }, [create, refresh]);

  // First arrival: no plans → the builder, at once.
  React.useEffect(() => {
    if (!online || !plans.isSuccess || plans.data.length > 0 || building !== null || embedded) return;
    void startNew();
  }, [online, plans.isSuccess, plans.data, building, embedded, startNew]);

  if (building !== null) {
    return (
      <DayBuilder
        planId={building.planId}
        initialScreen={building.screen}
        embedded={embedded}
        onExit={() => {
          void refresh();
          setBuilding(null);
        }}
      />
    );
  }

  const list = plans.data ?? [];
  const finish = async () => {
    setLine(null);
    setFinishing(true);
    try {
      await completeFirstRun.mutateAsync({});
      router.replace(todayRoute());
    } catch {
      setLine(COPY.saveError);
      setFinishing(false);
    }
  };

  const cards = (
    <div className="flex flex-col gap-(--space-3)">
      {list.map((plan: DayPlanSummaryView) => (
        <DayPlanCard
          key={plan.id}
          plan={plan}
          templates={templates.data ?? []}
          disabled={!online}
          onEdit={() => setBuilding({ planId: plan.id, screen: "i" })}
          onContinue={() => setBuilding({ planId: plan.id, screen: resumeScreen(plan) })}
          onDuplicate={() => {
            setLine(null);
            void duplicate
              .mutateAsync({ id: plan.id })
              .then(async (copy) => {
                await refresh();
                setBuilding({ planId: copy.id, screen: "a" });
              })
              .catch(() => setLine(COPY.saveError));
          }}
          onDelete={async () => {
            setLine(null);
            try {
              await remove.mutateAsync({ id: plan.id });
              await refresh();
            } catch {
              setLine(COPY.saveError);
            }
          }}
        />
      ))}
    </div>
  );

  const body = (
    <>
      {plans.isLoading ? <LoadingText /> : null}
      {plans.isSuccess && list.length === 0 && embedded ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.noDaysYet}
        </Text>
      ) : null}
      {cards}
      <Button
        variant="secondary"
        disabled={!online}
        busy={create.isPending}
        onClick={() => void startNew()}
        className="w-full wide:w-auto wide:self-start"
      >
        {COPY.buildAnotherDay}
      </Button>
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-(--space-5)">
        {body}
        {line ? <HelperText error>{line}</HelperText> : null}
        {!online ? <HelperText>{COPY.offline}</HelperText> : null}
      </div>
    );
  }

  return (
    <StepFrame
      step={13}
      heading={COPY.yourDays}
      error={line}
      primary={{
        label: COPY.continueDays(list.length),
        onClick: () => void finish(),
        busy: finishing,
        disabled: list.length === 0,
      }}
    >
      <div className="flex flex-col gap-(--space-5)">{body}</div>
    </StepFrame>
  );
}

/** A draft resumes where its parts stop: the first list it has no reference for, else the review. */
export function resumeScreen(plan: DayPlanSummaryView): BuilderScreen {
  if (plan.weekdays.length === 0) return "a";
  if (plan.gettingReady === null) return "d";
  if (plan.morning === null) return "e";
  if (plan.windDown === null) return "h";
  return "i";
}
