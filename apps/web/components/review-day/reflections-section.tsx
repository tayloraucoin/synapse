"use client";

import * as React from "react";

import {
  ReflectionBlock,
  type ReflectionAxis,
  type Stepper17Value,
} from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import type { ReviewDay } from "./use-review-day";

/**
 * DR-06's bodies — the section REV-2 left as a header with a count.
 *
 * IT WRITES THROUGH THE ITEM'S OWN MUTATIONS. `item.rate` and `item.setNote`
 * are USE-3's, used by the item sheet, and they are used here unchanged: a
 * rating entered in the review and a rating entered from the List are the same
 * fact about the same row, and two write paths would be two places the
 * snapshot rules could diverge.
 *
 * RATINGS WRITE ON CHANGE; NOTES WRITE ON COLLAPSE. A stepper is a decision —
 * one tap, done — so it saves at once and the heading's count moves. A note is
 * a sentence being composed, and saving each keystroke would be a request per
 * character; it is flushed when the section closes and when the review is
 * finished or saved.
 *
 * NOTHING HERE IS IN EDIT MODE'S BATCH. Reflections never affect the number,
 * so they are not part of what *Discard changes?* protects — and they are
 * always editable, on any day, closed or not (cross-cutting §8.1). A reflection
 * saved on a reviewed day does NOT stamp `review_edited_at`: the stamp is about
 * the number, and this cannot move it.
 */
export function ReflectionsSection({
  day,
  onChanged,
  registerFlush,
}: {
  day: ReviewDay;
  onChanged: () => void;
  /**
   * Hands the parent a way to flush pending notes before finishing or saving.
   * The section owns the drafts, so it owns the flush.
   */
  registerFlush?: (flush: () => Promise<void>) => void;
}) {
  const rate = trpc.item.rate.useMutation();
  const setNote = trpc.item.setNote.useMutation();

  // Drafts, keyed by item. Absent means "unchanged since load".
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const draftsRef = React.useRef(drafts);
  draftsRef.current = drafts;

  const flush = React.useCallback(async () => {
    const pending = Object.entries(draftsRef.current);
    if (pending.length === 0) return;

    setDrafts({});
    await Promise.all(
      pending.map(([id, note]) =>
        setNote.mutateAsync({ id, note: note.trim() === "" ? null : note }),
      ),
    );
    onChanged();
  }, [setNote, onChanged]);

  React.useEffect(() => {
    registerFlush?.(flush);
  }, [registerFlush, flush]);

  // The section is unmounted when the panel collapses, so this is the collapse
  // and the navigation both — every path out of the section flushes.
  React.useEffect(
    () => () => {
      void flush();
    },
    [flush],
  );

  return (
    <div className="flex flex-col gap-(--space-6)">
      {day.reflectionItems.map((entry) => (
        <ReflectionBlock
          key={entry.item.id}
          item={entry.item}
          axes={axesFor(entry)}
          note={drafts[entry.item.id] ?? entry.note ?? ""}
          onRate={(axis, value) => {
            rate.mutate(
              { id: entry.item.id, axis, value },
              { onSuccess: () => onChanged() },
            );
          }}
          onNoteChange={(note) =>
            setDrafts((current) => ({ ...current, [entry.item.id]: note }))
          }
        />
      ))}
    </div>
  );
}

/**
 * The axes as the block wants them, from the item's snapshot.
 *
 * THE LABEL IS THE AXIS. A habit's axes are words the person chose ("focus",
 * "energy"), so there is nothing to look up and nothing to translate — and a
 * title-cased copy would be the app editing their words.
 */
function axesFor(entry: ReviewDay["reflectionItems"][number]): ReflectionAxis[] {
  return entry.axes.map((axis) => ({
    key: axis,
    label: axis,
    value: toStepperValue(entry.ratings[axis]),
  }));
}

function toStepperValue(value: number | undefined): Stepper17Value | null {
  if (value === undefined) return null;
  return value >= 1 && value <= 7 ? (value as Stepper17Value) : null;
}
