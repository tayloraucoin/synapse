"use client";

import * as React from "react";

import { BLOCK_KIND_WORDS, HelperText, PickerList, ResponsiveSheet, SegmentedControl, type PickerListGroup } from "@syn/ui";
import type { BlockKind, HabitSummaryView } from "@syn/types";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { DAY_HEADER_SHEET_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * *Add from the library* — UX v1.1 §6.2 (DYN-15): the library's habits,
 * grouped by this day's block kinds then *Anywhere*, and which block the
 * pick lands in (a habit's own kind when that block is on the day). Tapping
 * a habit adds a habit-day item at the end of that block and the block
 * re-flows; on an unstructured day the item has no block.
 */
export function LibraryPickSheet({
  open,
  day,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  day: DayView;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}) {
  const online = useOnline();
  const habits = trpc.habit.list.useQuery({ includeArchived: false }, { enabled: open });
  const add = trpc.day.addFromLibrary.useMutation();
  const [into, setInto] = React.useState<string>("none");
  const [error, setError] = React.useState<string | null>(null);

  const kinds = React.useMemo(() => {
    const seen = new Set<BlockKind>();
    for (const block of day.blocks) {
      if (block.kind === "training" || block.kind === "break" || block.state === "not_today") continue;
      seen.add(block.kind);
    }
    return [...seen];
  }, [day.blocks]);

  const list = React.useMemo(
    () => (habits.data?.habits ?? []).filter((habit) => habit.type === "habit" && !habit.archived),
    [habits.data?.habits],
  );

  const groups = React.useMemo<PickerListGroup[]>(() => {
    const toItem = (habit: HabitSummaryView) => ({ id: habit.id, icon: habit.icon, title: habit.title });
    const byKind = kinds.map((kind) => ({
      heading: BLOCK_KIND_WORDS[kind],
      items: list.filter((habit) => habit.blockKind === kind).map(toItem),
    }));
    const rest = list.filter((habit) => !kinds.includes(habit.blockKind as BlockKind)).map(toItem);
    return [...byKind, { heading: COPY.anywhere, items: rest }].filter((group) => group.items.length > 0);
  }, [kinds, list]);

  async function pick(id: string): Promise<void> {
    const habit = list.find((row) => row.id === id);
    if (!habit || !online) return;
    setError(null);
    // The habit's own block when it is on the day, else the chosen one.
    const own = habit.blockKind !== null && kinds.includes(habit.blockKind) ? habit.blockKind : null;
    const blockKind = into === "none" ? own : (into as BlockKind);
    try {
      await add.mutateAsync({ date: day.dateKey, habitId: id, blockKind });
      onAdded?.();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={COPY.pickTitle} size="tall" initialFocus="first-field">
        <div className="flex flex-col gap-(--space-4)">
          {kinds.length > 0 ? (
            <SegmentedControl
              label={COPY.into}
              value={into}
              onChange={setInto}
              options={[
                { value: "none", label: COPY.noBlock },
                ...kinds.map((kind) => ({ value: kind as string, label: BLOCK_KIND_WORDS[kind] })),
              ]}
              stacked="auto"
              disabled={!online || add.isPending}
            />
          ) : null}
          <PickerList
            groups={groups}
            value={null}
            onSelect={(id) => void pick(id)}
            searchLabel={COPY.pickSearch}
            emptyText={COPY.pickEmpty}
            presentation="inline"
            className={!online || add.isPending ? "pointer-events-none opacity-50" : undefined}
          />
          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}
