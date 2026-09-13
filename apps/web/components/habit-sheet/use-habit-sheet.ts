"use client";

import * as React from "react";

import type { BlockKind, IconValue } from "@syn/types";
import { habitFormSchema, type HabitFormInput } from "@syn/validators";

import { useIconUpload } from "@/lib/hooks/use-icon-upload";
import { useSynapseForm } from "@/lib/forms/use-synapse-form";
import { trpc } from "@/lib/trpc/client";

import { HABIT_SHEET_COPY as COPY } from "./copy";

/**
 * LB-02's behaviour, headless.
 *
 * THE SHEET IS OPENED FROM FIVE PLACES — LB-01, first run, the slot sheet, the
 * one-off sheet, and Day & time. The hook exists so those five share one set
 * of rules rather than five that agree today: the fifth caller to re-implement
 * "required range unless it is a task" is the one that gets it wrong.
 *
 * THE IMAGE COMMIT ORDER IS THE INTERESTING PART. `useIconUpload` parks a
 * cropped blob locally and commits when told, because on create the habit has
 * no id yet and the storage path is built from one. So: create the habit, then
 * commit the image, then patch the icon. On edit the row exists, so the commit
 * happens first and the icon is part of the single save. A failed commit
 * leaves a saved habit with the neutral dot and the hook's sentence — never a
 * lost habit, because the image is the optional half.
 */

const DEFAULT_ICON: IconValue = {
  kind: "curated",
  value: "dot",
  colorKey: null,
};

/** Stable empties, so a loading query does not change identity every render. */
const EMPTY_HABITS: never[] = [];
const EMPTY_CATEGORIES: never[] = [];

function emptyValues(): HabitFormInput {
  return {
    title: "",
    icon: DEFAULT_ICON,
    categoryId: null,
    blockKind: null,
    durationMinMin: null,
    durationMaxMin: null,
    // `Stepper17` starts unselected; zod reports the document's sentence when
    // a person submits without choosing.
    lifePriority: null as unknown as number,
    quantityUnit: null,
    reflectionAxes: [],
    defaultNotesPreflight: null,
    isWakeAnchor: false,
  };
}

export type HabitSheetMode = "create" | "edit";

export interface UseHabitSheetOptions {
  open: boolean;
  mode: HabitSheetMode;
  habitId?: string;
  /**
   * `blockKind` presets the block chip row (the editor's *Add → New habit*).
   * `type` is kept for callers' signatures; the sheet makes habits only (v1.1 §4.15).
   */
  defaults?: { type?: string; blockKind?: BlockKind | null };
  onSaved?: (habit: { id: string }) => void;
  onOpenChange: (open: boolean) => void;
}

export function useHabitSheet({
  open,
  mode,
  habitId,
  defaults,
  onSaved,
  onOpenChange,
}: UseHabitSheetOptions) {
  const utils = trpc.useUtils();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [rangeWarning, setRangeWarning] = React.useState<number | null>(null);

  const list = trpc.habit.list.useQuery(undefined, { enabled: open });
  const existing = trpc.habit.get.useQuery(
    { id: habitId ?? "" },
    { enabled: open && mode === "edit" && Boolean(habitId) },
  );
  const templateCount = trpc.habit.templateCount.useQuery(
    { id: habitId ?? "" },
    { enabled: open && mode === "edit" && Boolean(habitId) },
  );

  const form = useSynapseForm<HabitFormInput>({
    schema: habitFormSchema,
    defaultValues: emptyValues(),
  });

  /**
   * SET-3's write rail: the server mints a signed URL at a path it names, the
   * browser PUTs the bytes there, and the stored path comes back. The PUT is a
   * plain `fetch` because the URL is already a complete credential — pulling
   * in the Supabase storage client to do one request would add a second way to
   * talk to storage from the browser, which is the thing SET-3's policies
   * exist to prevent.
   */
  const createUploadUrl = trpc.asset.createUploadUrl.useMutation();

  const iconUpload = useIconUpload({
    upload: async (blob) => {
      try {
        const minted = await createUploadUrl.mutateAsync({
          kind: "icon",
          contentType: "image/jpeg",
        });
        const put = await fetch(minted.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        return put.ok ? minted.path : null;
      } catch {
        return null;
      }
    },
  });

  // Load the row into the form once, when the sheet opens in edit mode.
  const loadedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      loadedFor.current = null;
      return;
    }
    if (mode !== "edit" || !existing.data) return;
    if (loadedFor.current === existing.data.id) return;

    /*
     * This sheet edits habits (UX v1.1 §4.15). A workout or a focus is edited
     * on its block screen (DYN-11), never here.
     */
    if (existing.data.type === "workout" || existing.data.type === "deep_work") {
      return;
    }

    loadedFor.current = existing.data.id;
    form.reset({
      title: existing.data.title,
      icon: existing.data.icon,
      categoryId: existing.data.categoryId,
      blockKind: existing.data.blockKind,
      durationMinMin: existing.data.durationMinMin,
      durationMaxMin: existing.data.durationMaxMin,
      lifePriority: existing.data.lifePriority,
      quantityUnit: existing.data.quantityUnit,
      reflectionAxes: existing.data.reflectionAxes,
      defaultNotesPreflight: existing.data.defaultNotesPreflight,
      // The anchor is retired (v1.1 R11, DYN-13): never written again.
      isWakeAnchor: false,
    });
  }, [open, mode, existing.data, form]);

  /*
   * Reset to a blank form each time the sheet opens in create mode.
   * `discardIcon` is pulled out because `iconUpload` is rebuilt each render
   * and its callbacks are not. Of `defaults`, only `blockKind` is read: the
   * block editor's *Add → New habit* presets the chip row to its own kind
   * (DYN-8); `type` is accepted for callers' sake, the sheet makes habits only.
   */
  const defaultBlockKind = defaults?.blockKind ?? null;
  const discardIcon = iconUpload.discard;

  React.useEffect(() => {
    if (!open || mode !== "create") return;
    form.reset({ ...emptyValues(), blockKind: defaultBlockKind });
    setFormError(null);
    discardIcon();
  }, [open, mode, form, discardIcon, defaultBlockKind]);

  const createMutation = trpc.habit.create.useMutation();
  const updateMutation = trpc.habit.update.useMutation();

  const categories = list.data?.categories ?? EMPTY_CATEGORIES;
  // Memoised because the duplicate-name and anchor-holder checks depend on it;
  // a fresh `[]` each render would recompute both on every keystroke.
  const habits = React.useMemo(
    () => list.data?.habits ?? EMPTY_HABITS,
    [list.data],
  );

  const title = form.watch("title");

  /** Non-blocking, computed from the list already loaded (SET-4's ruling). */
  const duplicateName = React.useMemo(() => {
    const trimmed = title.trim().toLowerCase();
    if (trimmed === "") return false;
    return habits.some(
      (habit) =>
        habit.title.toLowerCase() === trimmed && habit.id !== habitId,
    );
  }, [title, habits, habitId]);

  async function persist(values: HabitFormInput): Promise<void> {
    setFormError(null);

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(values);

        // The path needs the id, so the image is committed after the insert
        // and patched on. A failure here leaves a real habit with the dot.
        if (iconUpload.hasPending) {
          const path = await iconUpload.commit();
          if (path !== null) {
            await updateMutation.mutateAsync({
              id: created.id,
              habit: { ...values, icon: { kind: "image", value: path } },
            });
          }
        }

        await utils.habit.list.invalidate();
        onSaved?.(created);
        onOpenChange(false);
        return;
      }

      if (!habitId) return;

      // On edit the row exists, so the image can be committed first and the
      // icon saved as part of one write.
      let icon = values.icon;
      if (iconUpload.hasPending) {
        const path = await iconUpload.commit();
        if (path !== null) icon = { kind: "image", value: path };
      }

      await updateMutation.mutateAsync({
        id: habitId,
        habit: { ...values, icon },
      });

      await utils.habit.list.invalidate();
      await utils.habit.get.invalidate({ id: habitId });
      onSaved?.({ id: habitId });
      onOpenChange(false);
    } catch {
      setFormError(COPY.formError);
    }
  }

  const submit = form.handleSubmit(async (values) => {
    /*
     * Narrowing the range can strand template slots. The dialog is a warning,
     * not a block — the slots keep their duration either way (Epic 1 LB-02);
     * it exists so the person knows the plan and the definition have drifted.
     * Zero until SET-5 exists, so the dialog never shows before then.
     */
    if (
      mode === "edit" &&
      habitId &&
      rangeWarning === null &&
      values.durationMinMin !== null &&
      values.durationMaxMin !== null
    ) {
      const outside = await utils.habit.slotsOutsideRange.fetch({
        id: habitId,
        min: values.durationMinMin,
        max: values.durationMaxMin,
      });
      if (outside > 0) {
        setRangeWarning(outside);
        return;
      }
    }

    await persist(values);
  });

  function confirmRangeWarning(): void {
    setRangeWarning(0);
    void form.handleSubmit(persist)();
  }

  /** The sheet is dirty when the form is, or when an image is parked. */
  const dirty = form.formState.isDirty || iconUpload.hasPending;

  function requestClose(): void {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  }

  function discard(): void {
    setDiscardOpen(false);
    iconUpload.discard();
    onOpenChange(false);
  }

  return {
    form,
    submit,
    saving: createMutation.isPending || updateMutation.isPending,
    formError,
    duplicateName,
    categories,
    habits,
    templateCount: templateCount.data ?? 0,
    archived: existing.data?.archived ?? false,
    loading: mode === "edit" && existing.isLoading,
    iconUpload,
    dirty,
    discardOpen,
    requestClose,
    discard,
    keepEditing: () => {
      setDiscardOpen(false);
    },
    rangeWarning,
    confirmRangeWarning,
    cancelRangeWarning: () => {
      setRangeWarning(null);
    },
  };
}
