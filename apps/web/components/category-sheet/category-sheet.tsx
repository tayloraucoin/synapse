"use client";

import * as React from "react";

import {
  Button,
  ColorSwatchRow,
  ConfirmDialog,
  HelperText,
  Input,
  ResponsiveSheet,
} from "@syn/ui";
import { CATEGORY_NAME_MAX } from "@syn/constants";
import type { CategoryKey } from "@syn/types";
import { CATEGORY_NAME_TAKEN } from "@syn/validators";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { CATEGORY_COPY as COPY } from "./copy";

/** The eight hues, in the document's order (official spec §9.3). */
const HUES: readonly CategoryKey[] = [
  "leaf",
  "sky",
  "clay",
  "rose",
  "amber",
  "slate",
  "plum",
  "moss",
];

/**
 * CT-02 — name a category and give it one of the eight hues.
 *
 * THE DEFAULT HUE IS THE FIRST UNUSED ONE (SET-4's ruling), computed from the
 * list already loaded. Someone naming their fourth category should not have to
 * notice that three of the swatches are taken; offering a fresh one is the
 * app doing the small piece of bookkeeping it can see and they cannot.
 *
 * THE UNIQUE-NAME SENTENCE COMES FROM TWO PLACES SAYING ONE THING: a
 * client-side pre-check against the loaded list, and a `CONFLICT` from the
 * unique index. The pre-check is for speed; the server's is the one that holds
 * under a race. Both use `CATEGORY_NAME_TAKEN`.
 */
export function CategorySheet({
  open,
  categoryId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** Absent in create mode. */
  categoryId?: string;
  onOpenChange: (open: boolean) => void;
  onSaved?: (category: { id: string }) => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const list = trpc.category.list.useQuery(undefined, { enabled: open });

  const [name, setName] = React.useState("");
  const [colorKey, setColorKey] = React.useState<CategoryKey>("leaf");
  const [error, setError] = React.useState<string | null>(null);

  const categories = React.useMemo(() => list.data ?? [], [list.data]);
  const editing = categories.find((category) => category.id === categoryId);

  const create = trpc.category.create.useMutation();
  const update = trpc.category.update.useMutation();
  const saving = create.isPending || update.isPending;

  // Seed the form when the sheet opens: the existing row in edit, or a name
  // and the first unused hue in create.
  const seededFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      seededFor.current = null;
      return;
    }
    const key = categoryId ?? "new";
    if (seededFor.current === key) return;
    if (categoryId && !editing) return;

    seededFor.current = key;
    setError(null);

    if (editing) {
      setName(editing.name);
      setColorKey(editing.key);
      return;
    }

    setName("");
    const used = new Set(categories.map((category) => category.key));
    setColorKey(HUES.find((hue) => !used.has(hue)) ?? "leaf");
  }, [open, categoryId, editing, categories]);

  async function save(): Promise<void> {
    const trimmed = name.trim();
    if (trimmed === "") {
      setError(COPY.nameRequired);
      return;
    }

    const clash = categories.some(
      (category) =>
        category.name.toLowerCase() === trimmed.toLowerCase() &&
        category.id !== categoryId,
    );
    if (clash) {
      setError(CATEGORY_NAME_TAKEN);
      return;
    }

    setError(null);

    try {
      const saved = categoryId
        ? await update.mutateAsync({ id: categoryId, name: trimmed, colorKey })
        : await create.mutateAsync({ name: trimmed, colorKey });

      await utils.category.list.invalidate();
      await utils.habit.list.invalidate();
      if (saved) onSaved?.(saved);
      onOpenChange(false);
    } catch (caught) {
      // The server's CONFLICT already carries the document's sentence.
      const message =
        caught instanceof Error && caught.message ? caught.message : COPY.failed;
      setError(message === CATEGORY_NAME_TAKEN ? CATEGORY_NAME_TAKEN : COPY.failed);
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={categoryId ? COPY.editTitle : COPY.createTitle}
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button
              onClick={() => void save()}
              busy={saving}
              disabled={!online}
            >
              {COPY.save}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <Input
            label={COPY.name}
            value={name}
            maxLength={CATEGORY_NAME_MAX}
            disabled={saving}
            onChange={(event) => {
              setName(event.target.value);
              if (error !== null) setError(null);
            }}
            error={error ?? undefined}
          />

          <ColorSwatchRow
            label={COPY.colour}
            value={colorKey}
            // CT-02 has no *none*: every category carries a hue (Epic 1
            // CT-02), so `allowNone` is off and this guard is belt and braces.
            onChange={(next) => {
              if (next !== null && next !== "none") setColorKey(next);
            }}
            disabled={saving}
          />

          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** CT-01's delete confirmation — one of the product's four real deletes. */
export function DeleteCategoryDialog({
  open,
  name,
  habitCount,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name: string;
  habitCount: number;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      title={COPY.deleteTitle(name)}
      description={COPY.deleteBody(habitCount)}
      confirmLabel={COPY.delete}
      cancelLabel={COPY.keep}
      onConfirm={onConfirm}
      onCancel={onCancel}
      busy={busy}
    />
  );
}
