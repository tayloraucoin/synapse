"use client";

import * as React from "react";

import {
  Button,
  CountStepper,
  EmptyState,
  InlineQuestionRow,
  Input,
  MultitaskGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SkeletonRow,
  StatusLine,
  Text,
  TimeField,
  WeekdayChips,
  toastUndo,
} from "@syn/ui";
import { TEMPLATE_NAME_MAX, UNDO_LONG_MS } from "@syn/constants";
import type { SlotView } from "@syn/types";
import type { Weekday } from "@syn/ui";
import { clockToMinutes } from "@syn/utils";

import { ReminderPrompt, useReminderPrompt } from "@/components/reminder-prompt";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";
import { settingsHabitsRoute } from "@/lib/routes";

import { TEMPLATE_COPY as COPY } from "./copy";
import { SlotRow } from "./slot-row";
import { SlotSheet } from "./slot-sheet";
import { useTemplateEditor } from "./use-template-editor";

/**
 * TP-02 — the template editor.
 *
 * THE DENSEST SCREEN IN THE PRODUCT, AND IT EARNS IT (Epic 1 TP-02). What
 * keeps it from arguing with the person: only ONE thing is ever refused — two
 * fixed slots at the same start — and even that is a question with two
 * answers rather than an error. Overlap between a fixed item and a window, or
 * between two items whose durations run into each other, is a fact the totals
 * line shows and the editor does not mention.
 *
 * `embedded` is SET-7's: first run renders this without the header, inside its
 * own frame. It is provided here and unused, so SET-7 adds no branch to this
 * component.
 */
export function TemplateEditor({
  templateId,
  embedded = false,
  editor,
}: {
  templateId: string;
  embedded?: boolean;
  /**
   * The editor state, owned by the screen above so the header and the body
   * share ONE autosave queue. Two `useTemplateEditor` calls would give the
   * header its own debounce and its own save status, and the status a person
   * reads would not be the status of the change they just made.
   */
  editor: ReturnType<typeof useTemplateEditor>;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const reminder = useReminderPrompt();

  const [slotSheet, setSlotSheet] = React.useState<{
    open: boolean;
    slotId?: string;
  }>({ open: false });

  const removeSlot = trpc.template.removeSlot.useMutation();
  const restoreSlot = trpc.template.restoreSlot.useMutation();
  const moveSlot = trpc.template.moveSlot.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();

  const { template, slots, collisions } = editor;

  if (editor.detail.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  if (!template) return null;

  const readOnly = editor.archived || !online;
  // UX v1.1 (DYN-4): the anchor comes from the profile per kind; the template's
  // own `anchorTime` is an override. The read model says where the walk began.
  const anchorClock = template.anchorClock ?? template.anchorTime ?? "07:00";
  const anchorMinutes = clockToMinutes(anchorClock);

  /**
   * Every slot mutation ends here, which makes this the one place that knows a
   * slot changed. TP-04's question on the way out is asked from that fact.
   */
  async function refresh(): Promise<void> {
    editor.markChanged();
    await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
  }

  return (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}
      {editor.saveFailed ? (
        <Text as="p" tone="secondary">
          {COPY.saveFailed}
        </Text>
      ) : null}

      {embedded ? (
        <Input
          label={COPY.nameLabel}
          defaultValue={template.name}
          maxLength={TEMPLATE_NAME_MAX}
          disabled={readOnly}
          onChange={(event) => {
            editor.patch({ name: event.target.value });
          }}
        />
      ) : null}

      {/* The settings row: three values, each one field in a popover. */}
      <div className="flex flex-wrap items-center gap-(--space-3)">
        <SettingPopover
          label={COPY.startsAt}
          value={anchorClock}
          disabled={readOnly}
        >
          <TimeField
            label={COPY.startsAt}
            value={anchorClock}
            onChange={(next) => {
              editor.patch({ anchorTime: next });
            }}
          />
        </SettingPopover>

        <SettingPopover
          label={COPY.targetLabel}
          value={
            template.weeklyTarget === null
              ? COPY.targetNone
              : `${template.weeklyTarget}/week`
          }
          disabled={readOnly}
        >
          <CountStepper
            label={COPY.targetLabel}
            helperText={COPY.targetHelper}
            value={template.weeklyTarget ?? 0}
            onChange={(next) => {
              // 0 is *none*, and *none* is null in the column — never 0.
              editor.patch({ weeklyTarget: next === 0 ? null : next });
            }}
            min={0}
            max={7}
            zeroLabel={COPY.targetNone}
          />
        </SettingPopover>

        <SettingPopover
          label={COPY.usually}
          value={
            template.typicalDays.length === 0
              ? COPY.usuallyAny
              : formatWeekdays(template.typicalDays)
          }
          disabled={readOnly}
        >
          <WeekdayChips
            label={COPY.usually}
            value={template.typicalDays as Weekday[]}
            onChange={(next) => {
              editor.patch({ typicalDays: next.length === 0 ? null : next });
            }}
          />
        </SettingPopover>
      </div>

      {editor.appliedDays > 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.appliedDays(editor.appliedDays)}
        </Text>
      ) : null}

      {slots.length === 0 ? (
        <EmptyState
          density="inline"
          text={COPY.emptySlots}
          actions={[
            {
              label: COPY.addItem,
              onClick: () => {
                setSlotSheet({ open: true });
              },
            },
          ]}
        />
      ) : (
        <ul className="flex flex-col">
          {renderSlots(slots, collisions, {
            onEdit: (id) => {
              setSlotSheet({ open: true, slotId: id });
            },
            onDuplicate: (slot) => {
              // A duplicate at the same start would collide, so it joins the
              // original's bracket — which is what "duplicate" means here.
              void saveSlot
                .mutateAsync({
                  templateId,
                  habitId: slot.habitId,
                  durationMin: slot.durationMin,
                  gapBeforeMin: 0,
                  pinnedClock: slot.pinnedClock,
                  role: slot.role,
                  priorityOverride: slot.overridden ? slot.priority : null,
                  scheduling: slot.scheduling,
                  multitaskWith: slot.id,
                })
                .then(refresh);
            },
            onRemove: (slot) => {
              void removeSlot
                .mutateAsync({ id: slot.id })
                .then(async (payload) => {
                  await refresh();
                  // A canvas removal is undoable, not confirmed (Epic 1 §10).
                  toastUndo({
                    text: COPY.removed(slot.title),
                    durationMs: UNDO_LONG_MS,
                    onUndo: () => {
                      void restoreSlot.mutateAsync({ payload }).then(refresh);
                    },
                  });
                });
            },
            onMove: (slot, direction) => {
              void moveSlot
                .mutateAsync({ id: slot.id, direction })
                .then(refresh);
            },
            onMultitask: (a, b) => {
              const later = slots.find((slot) => slot.id === b);
              if (!later) return;
              void saveSlot
                .mutateAsync({
                  templateId,
                  slotId: later.id,
                  habitId: later.habitId,
                  durationMin: later.durationMin,
                  gapBeforeMin: later.gapBeforeMin,
                  pinnedClock: later.pinnedClock,
                  role: later.role,
                  priorityOverride: later.overridden ? later.priority : null,
                  scheduling: later.scheduling,
                  multitaskWith: a,
                })
                .then(refresh);
            },
            disabled: readOnly,
          })}
        </ul>
      )}

      {readOnly ? null : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setSlotSheet({ open: true });
          }}
        >
          {COPY.addItem}
        </Button>
      )}

      <TotalsLine slots={slots} />

      <a
        href={settingsHabitsRoute()}
        className="self-start font-medium text-ink underline underline-offset-4"
      >
        {COPY.manageHabits}
      </a>

      <SlotSheet
        open={slotSheet.open}
        templateId={templateId}
        anchorTime={anchorClock}
        slotId={slotSheet.slotId}
        previousEndMin={lastEndOffset(slots, anchorMinutes)}
        onOpenChange={(next) => {
          setSlotSheet(next ? { open: true } : { open: false });
        }}
        onSaved={(saved) => {
          void refresh();
          // SET-9's ask: the only moment reminders are ever offered, and only
          // when the person has just committed to something at a time.
          reminder.maybeOffer(saved);
        }}
      />

      <ReminderPrompt controller={reminder} />
    </div>
  );
}

/** One of the three settings values, each a field behind its own trigger. */
function SettingPopover({
  label,
  value,
  disabled,
  children,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      {/* The trigger's name carries the value — "Starts at, 7:00". */}
      <PopoverTrigger asChild>
        <Button variant="ghost" disabled={disabled} aria-label={`${label}, ${value}`}>
          <span className="text-text-secondary">{label}</span>
          <span className="ms-(--space-2) font-medium">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}

/**
 * Slots in time order, brackets around groups, and the collision question
 * between any ungrouped pair that shares a start.
 */
function renderSlots(
  slots: readonly SlotView[],
  collisions: ReadonlyArray<[string, string]>,
  handlers: {
    onEdit: (id: string) => void;
    onDuplicate: (slot: SlotView) => void;
    onRemove: (slot: SlotView) => void;
    onMove: (slot: SlotView, direction: "up" | "down") => void;
    onMultitask: (a: string, b: string) => void;
    disabled: boolean;
  },
): React.ReactNode[] {
  const output: React.ReactNode[] = [];
  let index = 0;

  while (index < slots.length) {
    const slot = slots[index];
    if (!slot) break;

    if (slot.multitask === "first") {
      const group: SlotView[] = [];
      while (index < slots.length) {
        const member = slots[index];
        if (!member || member.multitask === "none") break;
        group.push(member);
        index += 1;
        if (member.multitask === "last") break;
      }
      output.push(
        <MultitaskGroup key={group[0]?.id ?? index} label={COPY.multitask}>
          {group.map((member) => (
            <SlotRow
              key={member.id}
              slot={member}
              disabled={handlers.disabled}
              onEdit={() => handlers.onEdit(member.id)}
              onDuplicate={() => handlers.onDuplicate(member)}
              onRemove={() => handlers.onRemove(member)}
              onMove={(direction) => handlers.onMove(member, direction)}
            />
          ))}
        </MultitaskGroup>,
      );
      continue;
    }

    output.push(
      <SlotRow
        key={slot.id}
        slot={slot}
        disabled={handlers.disabled}
        onEdit={() => handlers.onEdit(slot.id)}
        onDuplicate={() => handlers.onDuplicate(slot)}
        onRemove={() => handlers.onRemove(slot)}
        onMove={(direction) => handlers.onMove(slot, direction)}
      />,
    );

    const pair = collisions.find(([, second]) => second === slots[index + 1]?.id);
    if (pair) {
      output.push(
        <li key={`collision-${pair[0]}-${pair[1]}`} className="list-none">
          <InlineQuestionRow
            text={COPY.collisionText}
            primary={{
              label: COPY.collisionPrimary,
              onClick: () => handlers.onMultitask(pair[0], pair[1]),
            }}
            secondary={{
              label: COPY.collisionSecondary,
              onClick: () => handlers.onEdit(pair[1]),
            }}
          />
        </li>,
      );
    }

    index += 1;
  }

  return output;
}

/** "{first} – {last} · {n} items · {total} min planned", plus flexible. */
function TotalsLine({ slots }: { slots: readonly SlotView[] }) {
  if (slots.length === 0) return null;

  const total = slots.reduce((sum, slot) => sum + slot.durationMin, 0);
  const flexible = slots
    .filter((slot) => slot.scheduling === "soft")
    .reduce((sum, slot) => sum + slot.durationMin, 0);

  const timed = slots.filter((slot) => slot.startClock !== null);
  const first = timed[0]?.startClock ?? null;
  const last = timed[timed.length - 1]?.startClock ?? null;

  return (
    <div className="flex flex-col gap-(--space-1)">
      <Text as="p" variant="secondary" tone="secondary">
        {first !== null && last !== null
          ? COPY.totals(first, last, slots.length, total)
          : COPY.totalsNoTimes(slots.length, total)}
      </Text>
      {flexible > 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.flexibleTotal(flexible)}
        </Text>
      ) : null}
    </div>
  );
}

/** Where the next slot starts by default — the last slot's end. */
function lastEndOffset(
  slots: readonly SlotView[],
  anchorMinutes: number,
): number {
  const timed = slots.filter((slot) => slot.startClock !== null);
  const last = timed[timed.length - 1];
  if (!last || last.startClock === null) return 0;
  return clockToMinutes(last.startClock) - anchorMinutes + last.durationMin;
}

/** "M W F" — the initials, in week order. */
function formatWeekdays(days: readonly number[]): string {
  const initials = ["M", "T", "W", "T", "F", "S", "S"];
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => initials[day] ?? "")
    .join(" ");
}
