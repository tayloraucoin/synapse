"use client";

import * as React from "react";

import { Text } from "@syn/ui";

import { HabitSetupCard } from "@/app/(setup)/_components/habit-setup-card";
import { trpc } from "@/lib/trpc/client";

import { BuilderSkeleton } from "../builder-skeleton";
import { DAY_BUILDER_COPY as COPY } from "../copy";

/**
 * B15b — free time, ranked (UX v1.3 §4.4 B15, R50; DAY-11) — a PROFILE
 * screen, on the first plan only.
 *
 * One `HabitSetupCard` per activity ticked on B15a, in the order ticked (the
 * landscape template's slots), WITHOUT the versions row — the seven squares
 * and *Usually takes* only. *Done* collapses in place with the matters cell,
 * as B10 does. *Matters* is what B16 preselects by (§13 #34) and orders its
 * rows by; *usually* is the length a pool offers.
 */
export function ScreenFreeTimeRanked() {
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "activity" });
  const templateId = templates.data?.find((template) => template.structure !== "opener_pool_closer")?.id ?? null;
  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null });
  const habits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "activity" });
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const loading = templates.isLoading || (templateId !== null && detail.isLoading) || habits.isLoading;
  const habitById = new Map((habits.data?.habits ?? []).map((habit) => [habit.id, habit]));
  const cards = (detail.data?.slots ?? []).flatMap((slot) => {
    const habit = habitById.get(slot.habitId);
    return habit ? [{ slot, habit }] : [];
  });

  if (loading) return <BuilderSkeleton />;
  if (cards.length === 0 || templateId === null) {
    return (
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.b15b.nothingToRank}
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-3)">
      {cards.map(({ slot, habit }) => (
        <HabitSetupCard
          key={slot.id}
          habit={habit}
          slot={slot}
          templateId={templateId}
          versions={false}
          initiallyOpen={!collapsed.has(slot.id)}
          onCollapse={() => setCollapsed((current) => new Set(current).add(slot.id))}
          onExpand={() =>
            setCollapsed((current) => {
              const next = new Set(current);
              next.delete(slot.id);
              return next;
            })
          }
        />
      ))}
    </div>
  );
}
