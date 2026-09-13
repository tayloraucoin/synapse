"use client";

import * as React from "react";

import { HelperText, PickerList, ResponsiveSheet, type PickerListGroup } from "@syn/ui";
import type { BlockKind, HabitSummaryView, SlotRole } from "@syn/types";

import { HabitSheet } from "@/components/habit-sheet";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { BLOCK_EDITOR_COPY as COPY } from "./copy";

/**
 * *Add* — UX v1.1 §3.11: the library filtered to this block's kind, with the
 * *Anywhere* habits after it (a habit's block is a default, §11.3 — a slot
 * may be placed anywhere). Tapping a habit saves a slot at the END of the
 * stack at the MIDPOINT of its range (W8), with no gap and the stack role;
 * the sheet closes and the block appears. Every other decision — the gap,
 * a pin, the role, *one of* — is the slot sheet's, opened on the block.
 *
 * *New habit* opens the habit sheet stacked with the chip row preset to
 * this kind; on save the new habit is added the same way.
 */

export interface AddSheetProps {
  open: boolean;
  templateId: string;
  kind: BlockKind;
  /** The role a new slot takes: `stack`, or `pool` on an opener·pool·closer block. */
  role?: SlotRole;
  onOpenChange: (open: boolean) => void;
  onAdded: () => Promise<void> | void;
}

/** The range's midpoint, rounded — W8. */
export function midpoint(habit: Pick<HabitSummaryView, "durationMin" | "durationMax">): number {
  if (habit.durationMin === null || habit.durationMax === null) return 15;
  return Math.round((habit.durationMin + habit.durationMax) / 2);
}

export function AddSheet({ open, templateId, kind, role = "stack", onOpenChange, onAdded }: AddSheetProps) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const habits = trpc.habit.list.useQuery({ includeArchived: false }, { enabled: open });
  const saveSlot = trpc.template.saveSlot.useMutation();

  const [error, setError] = React.useState<string | null>(null);
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);

  const list = React.useMemo(() => habits.data?.habits ?? [], [habits.data?.habits]);

  const groups = React.useMemo<PickerListGroup[]>(() => {
    const toItem = (habit: HabitSummaryView) => ({
      id: habit.id,
      icon: habit.icon,
      title: habit.title,
      meta:
        habit.durationMin === null || habit.durationMax === null
          ? undefined
          : `${habit.durationMin}–${habit.durationMax} min`,
    });
    const thisBlock = list.filter((habit) => !habit.archived && habit.blockKind === kind);
    const anywhere = list.filter((habit) => !habit.archived && habit.blockKind === null);
    return [
      { heading: COPY.thisBlock, items: thisBlock.map(toItem) },
      { heading: COPY.anywhere, items: anywhere.map(toItem) },
    ].filter((group) => group.items.length > 0);
  }, [list, kind]);

  async function add(habit: Pick<HabitSummaryView, "id" | "durationMin" | "durationMax">): Promise<void> {
    setError(null);
    try {
      await saveSlot.mutateAsync({
        templateId,
        habitId: habit.id,
        durationMin: midpoint(habit),
        gapBeforeMin: 0,
        pinnedClock: null,
        role,
        priorityOverride: null,
        scheduling: "soft",
      });
      await onAdded();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.addTitle}
        size="tall"
        initialFocus="first-field"
      >
        <div className="flex flex-col gap-(--space-3)">
          <PickerList
            groups={groups}
            value={null}
            onSelect={(id) => {
              const chosen = list.find((habit) => habit.id === id);
              if (chosen && online && !saveSlot.isPending) void add(chosen);
            }}
            searchLabel={COPY.searchLabel}
            emptyText={COPY.habitEmpty("")}
            createLabel={COPY.newHabit}
            onCreate={() => {
              setHabitSheetOpen(true);
            }}
            presentation="inline"
          />
          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      <HabitSheet
        open={habitSheetOpen}
        mode="create"
        defaults={{ blockKind: kind }}
        onOpenChange={setHabitSheetOpen}
        onSaved={(created) => {
          void utils.habit.list.invalidate().then(async () => {
            const fresh = await utils.habit.get.fetch({ id: created.id });
            await add({
              id: created.id,
              durationMin: fresh.durationMinMin,
              durationMax: fresh.durationMaxMin,
            });
          });
        }}
      />
    </SheetHost>
  );
}
