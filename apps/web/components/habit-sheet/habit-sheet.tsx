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
  RangeInput,
  ResponsiveSheet,
  SegmentedControl,
  Stepper17,
  Switch,
  Text,
  TextDisclosureButton,
  Textarea,
  type Stepper17Value,
} from "@syn/ui";
import {
  PREFLIGHT_NOTE_MAX,
  QUANTITY_UNIT_MAX,
  REFLECTION_AXES_MAX,
  REFLECTION_AXIS_MAX,
  HABIT_TITLE_MAX,
} from "@syn/constants";
import type { HabitFormInput } from "@syn/validators";

import { SheetHost } from "@/components/page-frame";
import { visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";

import { HABIT_SHEET_COPY as COPY } from "./copy";
import { IconChooser } from "./icon-chooser";
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
export interface HabitSheetProps extends UseHabitSheetOptions {
  /** Opens CT-02 stacked, from the chip picker's *+ New category*. */
  onCreateCategory?: () => void;
  onRestore?: () => void;
}

export function HabitSheet({
  onCreateCategory,
  onRestore,
  ...options
}: HabitSheetProps) {
  const online = useOnline();
  const sheet = useHabitSheet(options);
  const { form } = sheet;

  const [moreOpen, setMoreOpen] = React.useState(false);
  const readOnly = sheet.archived;
  const disabled = readOnly || !online || sheet.saving;

  const values = form.watch();

  // "Open by default in edit mode if any of its fields are set" (Epic 1 LB-02).
  const optionalsSet =
    values.quantityUnit !== null ||
    values.reflectionAxes.length > 0 ||
    values.defaultNotesPreflight !== null ||
    values.isWakeAnchor;

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

          <SegmentedControl
            label={COPY.type}
            value={values.type}
            onChange={(next) => {
              form.setValue("type", next, { shouldDirty: true });
            }}
            disabled={disabled}
            options={[
              {
                value: "habit" as const,
                label: COPY.typeOptions.habit,
                helper: COPY.typeHelpers.habit,
              },
              {
                value: "task_appointment" as const,
                label: COPY.typeOptions.task_appointment,
                helper: COPY.typeHelpers.task_appointment,
              },
              {
                value: "deep_work" as const,
                label: COPY.typeOptions.deep_work,
                helper: COPY.typeHelpers.deep_work,
              },
            ]}
          />

          {options.mode === "edit" && sheet.templateCount > 0 ? (
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.typeChangeKeepsTemplates}
            </Text>
          ) : null}

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

          <RangeInput
            label={COPY.range}
            from={values.durationMinMin}
            to={values.durationMaxMin}
            onChange={(next) => {
              form.setValue("durationMinMin", next.from, { shouldDirty: true });
              form.setValue("durationMaxMin", next.to, { shouldDirty: true });
            }}
            helperText={
              values.type === "task_appointment"
                ? COPY.rangeHelperOptional
                : COPY.rangeHelperRequired
            }
            required={values.type !== "task_appointment"}
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

              {/* Only a Habit can be the wake anchor (Epic 1 LB-02). */}
              {values.type === "habit" ? (
                <div className="flex flex-col gap-(--space-2)">
                  <div className="flex items-center justify-between gap-(--space-3)">
                    <Label htmlFor="habit-wake-anchor">
                      {COPY.wakeAnchor}
                    </Label>
                    <Switch
                      id="habit-wake-anchor"
                      checked={values.isWakeAnchor}
                      disabled={disabled}
                      onCheckedChange={(next) => {
                        form.setValue("isWakeAnchor", next, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                  <HelperText>{COPY.wakeAnchorHelper}</HelperText>
                  {sheet.anchorHolder === null ? null : (
                    <Text as="p" variant="secondary" tone="secondary">
                      {COPY.wakeAnchorReplaces(sheet.anchorHolder)}
                    </Text>
                  )}
                </div>
              ) : null}
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
