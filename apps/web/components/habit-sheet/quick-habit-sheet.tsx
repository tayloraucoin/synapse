"use client";

import * as React from "react";

import { Button, DiscardDialog, EmojiSlotButton, HelperText, Input, RangeEditor, ResponsiveSheet } from "@syn/ui";
import { DURATION_MAX, DURATION_MIN, HABIT_TITLE_MAX } from "@syn/constants";
import type { IconValue } from "@syn/types";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { HABIT_SHEET_COPY as COPY } from "./copy";

/**
 * The habit sheet's two quick modes — UX v1.2 §4.7, §4.8 (RUN-10).
 *
 * *A step before work* and *A morning habit*: emoji, name, a compact range —
 * "and nothing else" (S7.3). No block (the mode fixes it), no priority, no
 * category, no *More*. The full sheet is LB-02's thirteen fields; this is
 * the three a first-run screen asks, in the same folder, behind the same
 * `HabitSheet` door (`mode: "step" | "morning-habit"`), so nothing outside
 * this folder learns a second component.
 *
 * A STEP is `habit.createStep` — `block_kind prep`, priority 7, hard, the
 * default glyph 📌 (RUN-3's rule). A MORNING HABIT is `habit.create` with
 * `block_kind morning` and the library's middle importance (4), which screen
 * 9 asks about properly.
 *
 * THE RANGE NEVER CLAMPS anything (R21); it is the default the plan reads.
 */

export type QuickHabitMode = "step" | "morning-habit" | "wind-down-habit" | "break";

const STEP_DEFAULT_ICON: IconValue = { kind: "emoji", value: "📌" };
const MORNING_DEFAULT_PRIORITY = 4;

export function QuickHabitSheet({
  open,
  mode,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: QuickHabitMode;
  onOpenChange: (open: boolean) => void;
  onSaved?: (habit: { id: string }) => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const createStep = trpc.habit.createStep.useMutation();
  const createHabit = trpc.habit.create.useMutation();

  const [icon, setIcon] = React.useState<IconValue | null>(mode === "step" ? STEP_DEFAULT_ICON : null);
  const [name, setName] = React.useState("");
  const [range, setRange] = React.useState<{ from: number | null; to: number | null }>({ from: 10, to: 20 });
  const [error, setError] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setIcon(mode === "step" ? STEP_DEFAULT_ICON : null);
    setName("");
    setRange({ from: 10, to: 20 });
    setError(null);
  }, [open, mode]);

  const dirty = name.trim() !== "";
  const from = range.from ?? DURATION_MIN;
  const to = range.to ?? from;
  const rangeOk = from >= DURATION_MIN && to <= DURATION_MAX && from <= to;
  const canSave = name.trim() !== "" && rangeOk;
  const busy = createStep.isPending || createHabit.isPending;

  async function submit(): Promise<void> {
    if (!canSave) return;
    setError(null);
    try {
      const saved =
        mode === "step"
          ? await createStep.mutateAsync({
              title: name.trim(),
              icon: icon ?? undefined,
              rangeMin: from,
              rangeMax: to,
            })
          : await createHabit.mutateAsync({
              title: name.trim(),
              icon: icon ?? STEP_DEFAULT_ICON,
              categoryId: null,
              blockKind: mode === "wind-down-habit" ? "wind_down" : mode === "break" ? "break" : "morning",
              durationMinMin: from,
              durationMaxMin: to,
              lifePriority: MORNING_DEFAULT_PRIORITY,
              quantityUnit: null,
              reflectionAxes: [],
              defaultNotesPreflight: null,
            });
      await utils.habit.list.invalidate();
      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      setError(COPY.quickSaveError);
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next && dirty) {
            setDiscardOpen(true);
            return;
          }
          onOpenChange(next);
        }}
        title={mode === "step" ? COPY.stepTitle : mode === "wind-down-habit" ? COPY.windDownHabitTitle : mode === "break" ? COPY.breakTitle : COPY.morningHabitTitle}
        dirty={dirty}
        onDiscardRequest={() => setDiscardOpen(true)}
        initialFocus="first-field"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button onClick={() => void submit()} busy={busy} disabled={!online || !canSave}>
              {COPY.save}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <div className="flex items-end gap-(--space-2)">
            <EmojiSlotButton icon={icon} label={COPY.chooseAnIcon} onChange={setIcon} className="mb-px" />
            <Input
              label={COPY.name}
              value={name}
              maxLength={HABIT_TITLE_MAX}
              autoFocus
              onChange={(event) => setName(event.target.value)}
              className="flex-1"
            />
          </div>
          <RangeEditor label={COPY.range} value={range} onChange={setRange} />
          {error ? <HelperText error>{error}</HelperText> : null}
        </div>
      </ResponsiveSheet>

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          onOpenChange(false);
        }}
      />
    </SheetHost>
  );
}
