"use client";

import * as React from "react";

import {
  Button,
  ChipPicker,
  ConfirmDialog,
  DiscardDialog,
  HelperText,
  Input,
  Label,
  QuickChipRow,
  RangeInput,
  ResponsiveSheet,
  Stepper17,
  Text,
  TextDisclosureButton,
  Textarea,
  type QuickChip,
  type Stepper17Value,
} from "@syn/ui";
import type { BlockKind } from "@syn/types";
import {
  PREFLIGHT_NOTE_MAX,
  QUANTITY_UNIT_MAX,
  REFLECTION_AXES_MAX,
  REFLECTION_AXIS_MAX,
  HABIT_TITLE_MAX,
} from "@syn/constants";
import type { HabitFormInput } from "@syn/validators";

import { SheetHost } from "@/components/page-frame";
import { useSubmitShortcut } from "@/lib/hooks/use-submit-shortcut";
import { visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";

import { HABIT_SHEET_COPY as COPY } from "./copy";
import { IconChooser } from "./icon-chooser";
import { QuickHabitSheet, type QuickHabitMode } from "./quick-habit-sheet";
import { useHabitSheet, type UseHabitSheetOptions } from "./use-habit-sheet";

/**
 * LB-02 — the one habit sheet.
 *
 * IT IS OPENED FROM FIVE PLACES and there is exactly one of it: LB-01, first
 * run (FR-02), the slot sheet (TP-03), the one-off sheet (WK-03), and Day &
 * time (ST-08). Every caller passes props. A second implementation of these
 * thirteen fields is a defect, not a variant — which is why the type is the
 * only thing a caller may pre-set, and even that through `defaults`.
 *
 * AN ARCHIVED HABIT OPENS READ-ONLY rather than in a different sheet: same
 * fields, all disabled, footer *Restore* · *Close* (SET-4's ruling). A second
 * component would be the fields written twice.
 */
/** The chip row's *Anywhere* — `blockKind` null, the library's own word. */
const ANYWHERE = "anywhere";

/**
 * The six habit-holding kinds (§4.15): training and work are rotations and
 * are set on the rotation's own sheet, never here.
 */
const BLOCK_CHIPS: readonly QuickChip[] = [
  { label: COPY.blockMorning, value: "morning" },
  { label: COPY.blockBeforeWork, value: "prep" },
  { label: COPY.blockBreak, value: "break" },
  { label: COPY.blockWindDown, value: "wind_down" },
  { label: COPY.blockAnywhere, value: ANYWHERE },
];

export interface FullHabitSheetProps extends UseHabitSheetOptions {
  /** Opens CT-02 stacked, from the chip picker's *+ New category*. */
  onCreateCategory?: () => void;
  onRestore?: () => void;
}

/** UX v1.2 §4.7, §4.8 (RUN-10): the two quick modes — emoji, name, range, nothing else. */
export interface QuickHabitSheetProps {
  open: boolean;
  mode: QuickHabitMode;
  onOpenChange: (open: boolean) => void;
  onSaved?: (habit: { id: string }) => void;
}

export type HabitSheetProps = FullHabitSheetProps | QuickHabitSheetProps;

function isQuick(props: HabitSheetProps): props is QuickHabitSheetProps {
  return props.mode === "step" || props.mode === "morning-habit";
}

/**
 * The one door. `mode: "step" | "morning-habit"` opens the three-field sheet
 * (UX v1.2 S7.3); `"create" | "edit"` opens LB-02's thirteen fields.
 */
export function HabitSheet(props: HabitSheetProps) {
  if (isQuick(props)) return <QuickHabitSheet {...props} />;
  return <FullHabitSheet {...props} />;
}

function FullHabitSheet({
  onCreateCategory,
  onRestore,
  ...options
}: FullHabitSheetProps) {
  const online = useOnline();
  const sheet = useHabitSheet(options);

  /*
   * SYS-4 — `Cmd/Ctrl+Enter` submits from *Note before starting*. `Enter` in
   * the textarea still inserts a newline, which is why the gesture needs the
   * modifier here and nowhere else.
   */
  const formRef = React.useRef<HTMLFormElement>(null);
  useSubmitShortcut(formRef);
  const { form } = sheet;

  const [moreOpen, setMoreOpen] = React.useState(false);
  const readOnly = sheet.archived;
  const disabled = readOnly || !online || sheet.saving;

  const values = form.watch();

  // "Open by default in edit mode if any of its fields are set" (Epic 1 LB-02).
  const optionalsSet =
    values.quantityUnit !== null ||
    values.reflectionAxes.length > 0 ||
    values.defaultNotesPreflight !== null;

  React.useEffect(() => {
    if (options.mode === "edit" && optionalsSet) setMoreOpen(true);
  }, [options.mode, optionalsSet]);

  const axes = values.reflectionAxes ?? [];

  return (
    <SheetHost open={options.open}>
      <ResponsiveSheet
        open={options.open}
        onOpenChange={(next) => {
          if (!next) {
            sheet.requestClose();
            return;
          }
          options.onOpenChange(true);
        }}
        title={
          options.mode === "create" ? COPY.createTitle : COPY.editTitle
        }
        subtitle={
          options.mode === "edit" && sheet.templateCount > 0
            ? COPY.usageLink(sheet.templateCount)
            : undefined
        }
        size="tall"
        dirty={sheet.dirty}
        onDiscardRequest={sheet.requestClose}
        initialFocus={options.mode === "create" ? "first-field" : "title"}
        footer={
          readOnly ? (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => options.onOpenChange(false)}>
                {COPY.close}
              </Button>
              <Button onClick={onRestore}>{COPY.restore}</Button>
            </div>
          ) : (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={sheet.requestClose}>
                {COPY.cancel}
              </Button>
              <Button
                onClick={() => void sheet.submit()}
                busy={sheet.saving}
                disabled={!online || sheet.iconUpload.busy}
              >
                {options.mode === "create" ? COPY.save : COPY.saveChanges}
              </Button>
            </div>
          )
        }
      >
        <form
          ref={formRef}
          className="flex flex-col gap-(--space-4)"
          onSubmit={(event) => {
            event.preventDefault();
            void sheet.submit();
          }}
        >
          <Input
            {...form.register("title")}
            label={COPY.name}
            maxLength={HABIT_TITLE_MAX}
            disabled={disabled}
            autoFocus={options.mode === "create"}
            error={visibleFieldError(form.formState, "title")}
          />

          {/* Non-blocking, and never an error: the person may want two. */}
          {sheet.duplicateName ? (
            <Text as="p" variant="secondary" tone="secondary" aria-live="polite">
              {COPY.duplicateName}
            </Text>
          ) : null}

          {/*
            UX v1.1 §4.15 (W6): this sheet makes habits, and only habits. The
            v1.0 type segment is gone; the block chip row (DYN-8) says which
            block the habit lives in by default — a default, not a fence
            (§11.3): a slot may still be placed anywhere.
          */}
          <QuickChipRow
            label={COPY.block}
            chips={BLOCK_CHIPS}
            selected={values.blockKind ?? ANYWHERE}
            onSelect={(next) => {
              form.setValue("blockKind", next === ANYWHERE ? null : (next as BlockKind), {
                shouldDirty: true,
              });
            }}
            disabled={disabled}
          />

          <IconChooser
            value={values.icon}
            onChange={(icon) => {
              form.setValue("icon", icon, { shouldDirty: true });
            }}
            pendingPreviewUrl={sheet.iconUpload.previewUrl}
            onPickFile={(file) => {
              void sheet.iconUpload.pick(file);
            }}
            onRemoveImage={sheet.iconUpload.discard}
            uploading={sheet.iconUpload.status === "uploading"}
            error={sheet.iconUpload.error}
            disabled={disabled}
          />

          {/* W7: the picker exists only once a category does. */}
          {sheet.categories.length === 0 ? null : (
            <ChipPicker
              label={COPY.category}
              options={sheet.categories.map((category) => ({
                value: category.id,
                label: category.name,
                colorKey: category.key,
              }))}
              value={values.categoryId}
              onChange={(next) => {
                form.setValue("categoryId", next, { shouldDirty: true });
              }}
              noneLabel={COPY.noneCategory}
              createLabel={onCreateCategory ? COPY.newCategory : undefined}
              onCreate={onCreateCategory}
              disabled={disabled}
            />
          )}

          <RangeInput
            label={COPY.range}
            from={values.durationMinMin}
            to={values.durationMaxMin}
            onChange={(next) => {
              form.setValue("durationMinMin", next.from, { shouldDirty: true });
              form.setValue("durationMaxMin", next.to, { shouldDirty: true });
            }}
            helperText={COPY.rangeHelperRequired}
            required
            disabled={disabled}
            error={
              visibleFieldError(form.formState, "durationMinMin") ??
              visibleFieldError(form.formState, "durationMaxMin")
            }
          />

          <Stepper17
            label={COPY.importance}
            helperText={COPY.importanceHelper}
            value={(values.lifePriority as Stepper17Value | null) ?? null}
            onChange={(next) => {
              form.setValue("lifePriority", next, { shouldDirty: true });
            }}
            captions
            required
            disabled={disabled}
            error={visibleFieldError(form.formState, "lifePriority")}
          />

          <TextDisclosureButton
            expanded={moreOpen}
            collapsedLabel={COPY.more}
            expandedLabel={COPY.more}
            onClick={() => {
              setMoreOpen((current) => !current);
            }}
            className="self-start"
          />

          {!moreOpen ? null : (
            <div className="flex flex-col gap-(--space-4)">
              <Input
                {...form.register("quantityUnit")}
                label={COPY.quantity}
                helperText={COPY.quantityHelper}
                placeholder={COPY.quantityPlaceholder}
                maxLength={QUANTITY_UNIT_MAX}
                disabled={disabled}
              />

              <div className="flex flex-col gap-(--space-2)">
                <Label>{COPY.reflection}</Label>
                <HelperText>{COPY.reflectionHelper}</HelperText>
                {Array.from({
                  length: Math.max(1, axes.length),
                }).map((_, index) => (
                  <Input
                    key={index}
                    value={axes[index] ?? ""}
                    placeholder={COPY.reflectionPlaceholder}
                    maxLength={REFLECTION_AXIS_MAX}
                    disabled={disabled}
                    onChange={(event) => {
                      const next = [...axes];
                      next[index] = event.target.value;
                      form.setValue(
                        "reflectionAxes",
                        next.filter((axis) => axis.trim() !== ""),
                        { shouldDirty: true },
                      );
                    }}
                  />
                ))}
                {axes.length > 0 && axes.length < REFLECTION_AXES_MAX ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => {
                      form.setValue("reflectionAxes", [...axes, ""], {
                        shouldDirty: true,
                      });
                    }}
                    className="self-start"
                  >
                    {COPY.addAnother}
                  </Button>
                ) : null}
              </div>

              <Textarea
                {...form.register("defaultNotesPreflight")}
                label={COPY.note}
                helperText={COPY.noteHelper}
                maxLength={PREFLIGHT_NOTE_MAX}
                disabled={disabled}
              />

              {/* The v1.0 wake-anchor switch is gone (v1.1 R11, DYN-13): the orient frame is the wake. */}
            </div>
          )}

          {!online ? <HelperText>{COPY.offline}</HelperText> : null}
          {sheet.formError === null ? null : (
            <HelperText error>{sheet.formError}</HelperText>
          )}
        </form>
      </ResponsiveSheet>

      <DiscardDialog
        open={sheet.discardOpen}
        onKeepEditing={sheet.keepEditing}
        onDiscard={sheet.discard}
      />

      <ConfirmDialog
        open={sheet.rangeWarning !== null && sheet.rangeWarning > 0}
        onOpenChange={(next) => {
          if (!next) sheet.cancelRangeWarning();
        }}
        title={COPY.rangeWarningTitle}
        description={COPY.rangeWarningBody(sheet.rangeWarning ?? 0)}
        confirmLabel={COPY.rangeWarningConfirm}
        cancelLabel={COPY.cancel}
        onConfirm={sheet.confirmRangeWarning}
        onCancel={sheet.cancelRangeWarning}
      />
    </SheetHost>
  );
}

export type { HabitFormInput };
