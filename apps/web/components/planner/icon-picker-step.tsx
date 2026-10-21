"use client";

import { useCallback } from "react";
import type { IconValue } from "@syn/types";
import {
  IconPicker,
  toastUndo,
  type IconPick,
  type IconPickerInitial,
  type IconSuggestCandidate,
} from "@syn/ui";
import { suggestIconsFor } from "@syn/utils";
import { iconValueSchema } from "@syn/validators";
import { useSavedColours } from "@/lib/data/use-saved-colours";
import { useRecentPicks, type RecentPicks } from "@/lib/hooks/use-recent-picks";

/**
 * IconPickerStep (USE-11): the icon picker as a step inside the sheet that
 * opens it, with back on the left. It wires what `IconPicker` leaves to its
 * caller: Suggested from the name through `suggestIconsFor`, on the device,
 * falling back to the block's kind's words when the name matches nothing
 * (USE-145);
 * Recent from this device; Saved colours through `useSavedColours`. Each
 * sheet's own ticket mounts it.
 */

export interface IconPickerStepProps {
  /** The item's name; empty before one is typed. */
  name: string;
  /** A block's kind: its words suggest when the name matches nothing. */
  kind?: string;
  value: IconValue | null;
  /** The sheet it returns to, as the back link reads. */
  backLabel: string;
  /** One tap picks: the sheet saves it and returns. */
  onPick: (value: IconValue) => void;
  onBack: () => void;
  /** A new colour for the current icon, without leaving the step. */
  onRecolour?: (value: IconValue) => void;
  /** Where it opens, and Recent, for `/dev/parts` captures. */
  initial?: IconPickerInitial & { recent?: RecentPicks };
}

const WORDS = {
  colourChanged: "Saved colour changed.",
  colourRemoved: "Removed from Saved.",
};

/** A pick as the `IconValue` the record stores, through its schema. */
export function toIconValue(pick: IconPick): IconValue {
  return iconValueSchema.parse(pick);
}

export function IconPickerStep({
  name,
  kind,
  value,
  backLabel,
  onPick,
  onBack,
  onRecolour,
  initial,
}: IconPickerStepProps) {
  const [recent, remember] = useRecentPicks(initial?.recent);
  const { query, add, update, remove, restore } = useSavedColours();
  const saved = query.data ?? [];

  const suggest = useCallback(
    (entries: readonly IconSuggestCandidate[]) =>
      suggestIconsFor(name, kind, entries),
    [name, kind],
  );

  function pick(next: IconPick) {
    remember(next.kind === "emoji" ? "emoji" : "icon", next.value);
    onPick(toIconValue(next));
  }

  function recolour(color: string) {
    if (value?.kind !== "lucide" || !onRecolour) return;
    onRecolour(toIconValue({ kind: "lucide", value: value.value, color }));
  }

  return (
    <IconPicker
      name={name}
      value={value}
      backLabel={backLabel}
      onBack={onBack}
      onPick={pick}
      onRecolour={recolour}
      suggest={suggest}
      recent={recent}
      savedColours={saved}
      onSaveColour={(hex) => add.mutate(hex)}
      onUpdateColour={(id, hex) => {
        const before = saved.find((s) => s.id === id);
        update.mutate({ id, hex });
        if (before) {
          toastUndo({
            text: WORDS.colourChanged,
            onUndo: () => update.mutate({ id, hex: before.hex }),
          });
        }
      }}
      onRemoveColour={(id) =>
        remove.mutate(id, {
          onSuccess: (row) => {
            if (row) {
              toastUndo({
                text: WORDS.colourRemoved,
                onUndo: () => restore.mutate(row),
              });
            }
          },
        })
      }
      initial={initial}
      className="flex-1"
    />
  );
}
