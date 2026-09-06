"use client";

import * as React from "react";

import type { SaveStatus } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

/**
 * TP-02's autosave, and the two rules that hang off it.
 *
 * A CANVAS AUTOSAVES AND NEVER PROMPTS TO DISCARD (Epic 1 §0.3, §10). There is
 * nothing unsaved to discard, which is why this hook has no dirty state and no
 * discard dialog — the sheet inside it has both, because a sheet is a form.
 *
 * THE QUEUE IS SERIAL ON PURPOSE. A name keystroke and an anchor change fired
 * together would race, and the loser would be silently reverted by the next
 * read. Patches are merged and sent one at a time, so the last value typed is
 * the last value written.
 *
 * THE STATUS IS PER BURST, NOT PER FIELD. `SaveStatusText` is a live region;
 * announcing "Saved" once per keystroke would talk over everything else on the
 * screen.
 */

const DEBOUNCE_MS = 400;
const MAX_ATTEMPTS = 3;

export type TemplatePatch = {
  name?: string;
  anchorTime?: string;
  weeklyTarget?: number | null;
  typicalDays?: number[] | null;
};

export function useTemplateEditor(templateId: string) {
  const utils = trpc.useUtils();
  const detail = trpc.template.get.useQuery({ id: templateId });
  const update = trpc.template.update.useMutation();

  const [status, setStatus] = React.useState<SaveStatus | undefined>(undefined);
  const [failed, setFailed] = React.useState(false);

  /** Merged while the debounce is open; drained by the timer. */
  const pending = React.useRef<TemplatePatch>({});
  const timer = React.useRef<number | null>(null);
  const inFlight = React.useRef(false);

  const flush = React.useCallback(async () => {
    if (inFlight.current) return;
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return;

    pending.current = {};
    inFlight.current = true;
    setStatus("saving");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        await update.mutateAsync({ id: templateId, patch });
        await utils.template.get.invalidate({ id: templateId });
        await utils.template.list.invalidate();
        setStatus("saved");
        setFailed(false);
        inFlight.current = false;
        // Anything queued while this was in flight goes now.
        if (Object.keys(pending.current).length > 0) void flush();
        return;
      } catch {
        if (attempt === MAX_ATTEMPTS) break;
        setStatus("retrying");
        await new Promise((resolve) =>
          window.setTimeout(resolve, 300 * attempt),
        );
      }
    }

    // Three failures: keep the local state and say so. Nothing is thrown away.
    setStatus("failed");
    setFailed(true);
    inFlight.current = false;
  }, [templateId, update, utils]);

  /**
   * Whether anything changed in this session — TP-04's trigger.
   *
   * It is a ref rather than state because nothing renders from it: asking the
   * question on the way out is the only thing it is for, and making it state
   * would re-render the canvas on the first keystroke to no effect.
   */
  const changed = React.useRef(false);

  /** Slot edits go through the sheet's own mutations, so they say so here. */
  const markChanged = React.useCallback(() => {
    changed.current = true;
  }, []);

  const patch = React.useCallback(
    (next: TemplatePatch) => {
      changed.current = true;
      pending.current = { ...pending.current, ...next };
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void flush();
      }, DEBOUNCE_MS);
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const template = detail.data?.template;

  /**
   * The "back is held once" rule (Epic 1 TP-02): a template with slots and no
   * name cannot be left silently, because it would list as *Untitled* forever.
   * Held ONCE — the second attempt leaves, because refusing twice would be the
   * editor holding someone hostage over a field the document calls optional
   * until it is not.
   */
  const heldOnce = React.useRef(false);

  const validateForLeave = React.useCallback((): boolean => {
    const name = template?.name.trim() ?? "";
    const hasSlots = (detail.data?.slots.length ?? 0) > 0;

    if (name !== "" || !hasSlots) return true;
    if (heldOnce.current) return true;

    heldOnce.current = true;
    return false;
  }, [template?.name, detail.data?.slots.length]);

  return {
    detail,
    template,
    slots: detail.data?.slots ?? [],
    collisions: detail.data?.collisions ?? [],
    appliedDays: detail.data?.appliedDays ?? 0,
    archived: template?.archived ?? false,
    status,
    saveFailed: failed,
    patch,
    markChanged,
    /** Read on the way out; TP-04 asks nothing when nothing changed. */
    hasChanged: () => changed.current,
    validateForLeave,
  };
}

export type TemplateEditorApi = ReturnType<typeof useTemplateEditor>;
