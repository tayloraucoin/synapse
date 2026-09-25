"use client";

import * as React from "react";

import { SkeletonRow, Text } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { HabitSetupCard } from "./habit-setup-card";

/**
 * Screen 9 — Your routine, ranked (UX v1.2 §4.9; RUN-10).
 *
 * "For each habit: how much it matters, how long it usually takes, and —
 * optionally — a shorter or longer version." One `HabitSetupCard` per
 * morning habit with a slot in the morning template, in slot order — the
 * order they were ticked on screen 8. *Continue* carries no count; nothing
 * here changes it. Nothing here reorders — the builder does.
 *
 * CARDS KEEP THEIR ORDER (UX v1.3 R58; T9.2; DAY-2). *Done* collapses a card
 * where it is and focus moves to its own *Edit*, so the window does not
 * scroll because nothing moved. (v1.2 sank collapsed cards beneath open ones;
 * the focus move to the sunk card's *Edit* was the jump.) `collapsed` is read
 * for `initiallyOpen` only — the list is the slots, as fetched.
 */
export function Step9Ranked({
  embedded = false,
  bare = false,
  onSaved,
}: {
  embedded?: boolean;
  /** Inside the day builder's frame as B10 (DAY-10): the content alone. */
  bare?: boolean;
  onSaved?: () => void;
}) {
  const templates = trpc.template.list.useQuery({ includeArchived: false, kind: "morning" });
  const templateId = templates.data?.[0]?.id ?? null;
  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null });
  const habits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "morning" });
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const loading = templates.isLoading || (templateId !== null && detail.isLoading) || habits.isLoading;
  const habitById = new Map((habits.data?.habits ?? []).map((habit) => [habit.id, habit]));
  const cards = (detail.data?.slots ?? []).flatMap((slot) => {
    const habit = habitById.get(slot.habitId);
    return habit ? [{ slot, habit }] : [];
  });

  return (
    <FactScreen
      step={9}
      heading={COPY.step9Heading}
      body={COPY.step9Body}
      save={null}
      embedded={embedded}
      bare={bare}
      onSaved={onSaved}
    >
      {loading ? (
        <div className="flex flex-col gap-(--space-2)">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : cards.length === 0 || templateId === null ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingToRank}
        </Text>
      ) : (
        <div className="flex flex-col gap-(--space-3)">
          {cards.map(({ slot, habit }) => (
            <HabitSetupCard
              key={slot.id}
              habit={habit}
              slot={slot}
              templateId={templateId}
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
      )}
    </FactScreen>
  );
}
