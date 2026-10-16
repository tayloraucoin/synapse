"use client";

/**
 * TodoSheet — one to-do's title, icon, type, repeat, reminder and notes,
 * over the day (USE-28; day/todo-sheet/). Opened at `?sheet=todo&id=` by a
 * tray row, or `&new=1` by "+ Add" › To-do.
 *
 * NO PRIMARY AND NO SAVE (D-USE-37). Each change writes once as it is made
 * through `useTodos().update`: a select or the switch on change, the title
 * and Notes when they lose focus (or Enter in the title). A change that
 * fails puts its field back and shows "Not saved. Try again." under its row,
 * in ink; every other row stays live.
 *
 * A NEW TO-DO (D-USE-69) opens with the title empty and focused, every other
 * row inert at its default, and is written once a title is typed; the sheet
 * then carries on as that to-do's.
 *
 * THE ICON TILE opens USE-11's IconPickerStep inside the sheet, back on the
 * left; `EmojiSlotButton`'s own popover would be a second picker, so the tile
 * is a plain button around `EmojiSlot`.
 *
 * ··· (USE-29) is `TodoMoreMenu`: Give it a day… opens `PickADayStep` in the
 * sheet and sets the to-do's day, the scope line then reading it; Mark done
 * checks it as its tray box does and closes, Undo in the toast; Delete to-do
 * deletes at once with no confirm, the to-do and the slots that took it, and
 * closes, Undo putting both back. The At row's Pick a day… opens the same
 * step for the reminder's day alone. Past days are closed in both.
 *
 * REPEATS › CUSTOM… (USE-110) opens USE-47's CustomRecurrenceStep in the
 * sheet, back on the left, no times and no usual week; its Done stores one
 * rule on the to-do through `update`'s `rrule`, as a block's (D-USE-80).
 */
import * as React from "react";
import type { IconValue } from "@syn/types";
import {
  Button,
  CloseIcon,
  cn,
  DisclosureIcon,
  EmojiSlot,
  MoreIcon,
  NotSavedIcon,
  ResponsiveSheet,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Text,
  Textarea,
  toastUndo,
} from "@syn/ui";
import {
  addDays,
  instantToWallClockMinutes,
  ruleBody,
  ruleStart,
  todoRepeatOptions,
} from "@syn/utils";
import type { TodoInput, TodoRecord } from "@syn/validators";
import { useDataSource } from "@/lib/data/source";
import { useTodoRecord, useTodos } from "@/lib/data/use-todos";
import { useReminderAvailability } from "@/lib/pwa/reminder-availability";
import {
  CUSTOM_RECURRENCE_COPY,
  CustomRecurrenceStep,
} from "../custom-recurrence";
import { IconPickerStep } from "../icon-picker-step";
import { TODO_SHEET_COPY as COPY } from "./copy";
import {
  customRepeatForm,
  customRepeatLabel,
  customRepeatWrite,
  giveADayWrite,
  notesWrite,
  reminderSwitchWrite,
  reminderTimeWrite,
  remindOnWrite,
  titleWrite,
} from "./fields";
import { PickADayStep } from "./pick-a-day-step";
import { ReminderRow } from "./reminder-row";
import { TodoMoreMenu } from "./todo-more-menu";
import { TODO_TYPE_OPTIONS, type TodoType } from "./types";

export interface TodoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The to-do, or null for a new one. */
  todoId: string | null;
  /** The new to-do was written: the sheet is now its. */
  onCreated: (id: string) => void;
  /** How: the Install sheet, focus going back to the button. */
  onHow: (opener: HTMLElement) => void;
  /** Settings at Notifications. */
  onSettings: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

type Field =
  "title" | "icon" | "day" | "type" | "repeats" | "reminder" | "notes";

/** The fields, or a step in the sheet's place. */
type Step = "fields" | "icon" | "give-a-day" | "remind-on" | "custom";

const ROW =
  "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b";

/** How long a capture waits for the sheet to rest before opening a list. */
const CAPTURE_SETTLE_MS = 600;

/** The Custom… row's value: it opens the custom step (USE-110). */
const CUSTOM = "custom";

function iconName(icon: IconValue | null): string | null {
  if (icon === null) return null;
  return icon.kind === "image" ? COPY.titleLabel : icon.value;
}

export function TodoSheet({
  open,
  onOpenChange,
  todoId,
  onCreated,
  onHow,
  onSettings,
  returnFocusRef,
}: TodoSheetProps) {
  const source = useDataSource();
  const todayKey = source.todayKey();
  const todos = useTodos(todayKey);
  const record = useTodoRecord(todayKey, todoId);
  const todo: TodoRecord | null = record.data ?? null;
  const isNew = todoId === null;
  const reminder = useReminderAvailability(source.scenario.device);

  const [step, setStep] = React.useState<Step>("fields");
  // ··· › Mark done or Delete that did not save: its Try again.
  const [actionFailed, setActionFailed] = React.useState<(() => void) | null>(
    null,
  );
  const [failed, setFailed] = React.useState<
    Partial<Record<Field, Partial<TodoInput>>>
  >({});
  const [announce, setAnnounce] = React.useState("");
  const [titleDraft, setTitleDraft] = React.useState<string | null>(null);
  const [notesDraft, setNotesDraft] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const repeatsRef = React.useRef<HTMLButtonElement>(null);

  // A capture opens a select inside the sheet (`view.open`).
  const startOpen = source.scenario.view?.open;
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [repeatsOpen, setRepeatsOpen] = React.useState(false);
  const hasTodo = todo !== null;
  React.useEffect(() => {
    if (!open || !hasTodo) return;
    // After the sheet has slid in, so the list opens against where it rests.
    const timer = window.setTimeout(() => {
      if (startOpen === "todo-type") setTypeOpen(true);
      if (startOpen === "todo-repeats") setRepeatsOpen(true);
      if (startOpen === "todo-give-a-day") setStep("give-a-day");
      if (startOpen === "todo-custom") setStep("custom");
    }, CAPTURE_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [open, hasTodo, startOpen]);

  // A fresh sheet each opening: no draft or failed line carries over.
  React.useEffect(() => {
    if (open) return;
    setStep("fields");
    setFailed({});
    setActionFailed(null);
    setTitleDraft(null);
    setNotesDraft(null);
  }, [open]);

  // Focus the title on open; a new to-do's is empty and ready to type.
  React.useEffect(() => {
    if (!open || step !== "fields") return;
    const frame = requestAnimationFrame(() => {
      if (isNew) titleRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, step, isNew]);

  async function save(field: Field, patch: Partial<TodoInput>) {
    if (todo === null) return;
    setFailed((map) => {
      const next = { ...map };
      delete next[field];
      return next;
    });
    const saved = await todos.update(todo.id, patch);
    if (saved) return;
    setFailed((map) => ({ ...map, [field]: patch }));
    setAnnounce(`${COPY.notSaved} ${COPY.tryAgain}.`);
  }

  async function commitTitle() {
    const draft = titleDraft;
    if (draft === null) return;
    const write = titleWrite(draft, isNew ? null : todo);
    if (write.kind === "create") {
      if (creating) return;
      setCreating(true);
      try {
        const created = await todos.add(write.title);
        setTitleDraft(null);
        onCreated(created.id);
      } catch {
        setFailed((map) => ({ ...map, title: { title: write.title } }));
        setAnnounce(`${COPY.notSaved} ${COPY.tryAgain}.`);
      } finally {
        setCreating(false);
      }
      return;
    }
    // A new one keeps its draft until it has a title.
    if (isNew) return;
    // An emptied title goes back to the one saved.
    setTitleDraft(null);
    if (write.kind === "update") await save("title", write.patch);
  }

  function notSaved(retry: () => void) {
    setActionFailed(() => retry);
    setAnnounce(COPY.notSavedAction);
  }

  async function markDone() {
    if (todo === null) return;
    const { id, title: name } = todo;
    setActionFailed(null);
    if (!(await todos.markDone(id))) {
      notSaved(() => void markDone());
      return;
    }
    onOpenChange(false);
    toastUndo({
      text: COPY.toast.done(name),
      onUndo: () => void todos.uncheck(id),
    });
  }

  async function remove() {
    if (todo === null) return;
    const name = todo.title;
    setActionFailed(null);
    const removed = await todos.remove(todo.id);
    if (removed === null) {
      notSaved(() => void remove());
      return;
    }
    onOpenChange(false);
    toastUndo({
      text: COPY.toast.deleted(name),
      onUndo: () => void todos.restore(removed),
    });
  }

  function pickDay(dateKey: string) {
    const target = step;
    setStep("fields");
    if (todo === null) return;
    if (target === "give-a-day") {
      const patch = giveADayWrite(dateKey, todo, todayKey);
      if (patch) void save("day", patch);
    } else {
      const patch = remindOnWrite(dateKey, todo, todayKey);
      if (patch) void save("reminder", patch);
    }
  }

  function commitNotes() {
    const draft = notesDraft;
    setNotesDraft(null);
    if (draft === null || todo === null) return;
    const patch = notesWrite(draft, todo);
    if (patch !== null) void save("notes", patch);
  }

  async function retry(field: Field) {
    const patch = failed[field];
    if (patch === undefined) return;
    if (field === "title" && isNew) {
      setTitleDraft(patch.title ?? "");
      return;
    }
    await save(field, patch);
  }

  function failedLine(field: Field) {
    if (failed[field] === undefined) return null;
    return (
      <p className="text-ink flex items-center gap-(--space-2) pb-(--space-2)">
        <NotSavedIcon aria-hidden="true" className="size-4 shrink-0" />
        <Text as="span" variant="secondary" tone="ink">
          {COPY.notSaved}{" "}
          <button
            type="button"
            onClick={() => void retry(field)}
            className="min-h-(--target) underline underline-offset-4"
          >
            {COPY.tryAgain}
          </button>
        </Text>
      </p>
    );
  }

  const title = titleDraft ?? todo?.title ?? "";
  const notes = notesDraft ?? todo?.notes ?? "";
  const type: TodoType = todo?.type ?? "other";
  const typeOption =
    TODO_TYPE_OPTIONS.find((option) => option.value === type) ??
    TODO_TYPE_OPTIONS[TODO_TYPE_OPTIONS.length - 1]!;

  // Repeats reads from the to-do's day, its rule's start, or today.
  const repeatDay =
    todo?.onDate ?? (todo?.rrule ? ruleStart(todo.rrule) : null) ?? todayKey;
  const repeatOptions = todoRepeatOptions(repeatDay);
  const repeatIndex =
    todo?.rrule == null
      ? 0
      : repeatOptions.findIndex(
          (option) =>
            option.rrule !== null &&
            ruleBody(option.rrule) === ruleBody(todo.rrule!),
        );
  // A custom rule picks no row, so Custom… always opens the step again.
  const repeatValue = repeatIndex === -1 ? "" : String(repeatIndex);
  const repeatLabel =
    repeatIndex === -1
      ? customRepeatLabel(todo!.rrule!, COPY.customRepeat)
      : (repeatOptions[repeatIndex]?.label ?? "");

  function backToRepeats() {
    setStep("fields");
    requestAnimationFrame(() => repeatsRef.current?.focus());
  }

  const reminderOn = todo?.remindAt != null;
  const available = reminder.known && reminder.availability === "available";
  const footer = !reminder.known
    ? COPY.footer.default
    : reminder.availability === "not-installed"
      ? COPY.footer.notInstalled
      : reminder.availability === "notifications-off"
        ? COPY.footer.notificationsOff
        : reminderOn
          ? COPY.footer.reminderOn(todo!.remindAt!)
          : COPY.footer.default;

  const inert = todo === null;

  const header =
    step !== "fields" ? (
      <span className="sr-only">{COPY.title}</span>
    ) : (
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => onOpenChange(false)}
          className="-ms-(--space-3)"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
        {todo === null ? (
          // A new to-do has nothing to give a day, finish or delete yet.
          <button
            type="button"
            aria-label={COPY.more(title || COPY.newTitle)}
            aria-disabled="true"
            className="inline-flex size-(--target) items-center justify-center rounded-full"
          >
            <span className="bg-surface text-foreground flex size-8 items-center justify-center rounded-full">
              <MoreIcon aria-hidden="true" className="size-4" />
            </span>
          </button>
        ) : (
          <TodoMoreMenu
            title={todo.title}
            defaultOpen={startOpen === "todo-more"}
            onGiveADay={() => setStep("give-a-day")}
            onMarkDone={() => void markDone()}
            onDelete={() => void remove()}
          />
        )}
      </div>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? COPY.newTitle : title || COPY.title}
      header={header}
      headerAction={null}
      footer={
        step !== "fields" ? undefined : (
          <Text as="p" variant="secondary" tone="muted">
            {footer}
          </Text>
        )
      }
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      // Up to 90dvh: the At row makes it taller rather than scrolling.
      size="tall"
      classes={{
        // A step brings its own back link: no × row above it.
        header:
          step === "give-a-day" || step === "remind-on" || step === "custom"
            ? "hidden"
            : "items-center pt-(--space-2)",
        body: "pt-0",
        footer: "border-t-0",
      }}
    >
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>

      {step === "custom" ? (
        <CustomRecurrenceStep
          caption={CUSTOM_RECURRENCE_COPY.caption(title, COPY.customSheet)}
          backTo={title || COPY.title}
          startKey={repeatDay}
          value={customRepeatForm(todo?.rrule ?? null, repeatDay)}
          usualWeek={false}
          onBack={backToRepeats}
          onDone={(form) => {
            backToRepeats();
            if (todo === null) return;
            const patch = customRepeatWrite(form, repeatDay, todo);
            if (patch) void save("repeats", patch);
          }}
        />
      ) : step === "give-a-day" || step === "remind-on" ? (
        <PickADayStep
          title={
            step === "give-a-day" ? COPY.step.giveADay : COPY.step.remindOn
          }
          backLabel={title || COPY.title}
          value={
            step === "give-a-day"
              ? (todo?.onDate ?? null)
              : (todo?.remindOn ?? null)
          }
          todayKey={todayKey}
          onPick={pickDay}
          onBack={() => setStep("fields")}
        />
      ) : step === "icon" ? (
        <IconPickerStep
          name={title}
          value={todo?.icon ?? null}
          backLabel={COPY.iconBack(title)}
          onBack={() => setStep("fields")}
          onPick={(icon) => {
            setStep("fields");
            void save("icon", { icon });
          }}
          onRecolour={(icon) => void save("icon", { icon })}
        />
      ) : (
        <div className="flex flex-col">
          <Text as="p" variant="secondary" tone="muted">
            {COPY.scope(todo?.onDate ?? null)}
          </Text>
          {failedLine("day")}
          {actionFailed === null ? null : (
            <p className="text-ink flex items-center gap-(--space-2) pb-(--space-2)">
              <NotSavedIcon aria-hidden="true" className="size-4 shrink-0" />
              <Text as="span" variant="secondary" tone="ink">
                {COPY.notSaved}{" "}
                <button
                  type="button"
                  onClick={actionFailed}
                  className="min-h-(--target) underline underline-offset-4"
                >
                  {COPY.tryAgain}
                </button>
              </Text>
            </p>
          )}

          <div className="flex items-center gap-(--space-3) py-(--space-3)">
            <button
              type="button"
              disabled={inert}
              aria-label={COPY.icon(iconName(todo?.icon ?? null))}
              onClick={() => setStep("icon")}
              className={cn(
                "bg-category-moss-chip inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:opacity-40",
              )}
            >
              <EmojiSlot icon={todo?.icon ?? null} />
            </button>
            {/* The title, edited in place: an input in the title's style. */}
            <input
              ref={titleRef}
              value={title}
              maxLength={COPY.titleMax}
              placeholder={isNew ? COPY.titlePlaceholder : undefined}
              aria-label={COPY.titleLabel}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={() => void commitTitle()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void commitTitle();
                }
                if (event.key === "Escape" && titleDraft !== null) {
                  event.stopPropagation();
                  setTitleDraft(null);
                }
              }}
              className={cn(
                "text-ink placeholder:text-muted-foreground min-h-(--target) min-w-0 flex-1 rounded-(--radius) bg-transparent",
                "text-(length:--fs-heading) font-semibold outline-none",
                "focus-visible:ring-ring focus-visible:ring-2",
              )}
            />
          </div>
          {failedLine("title")}

          <div className={cn(ROW, "border-t")}>
            <Text as="span" variant="body" tone="ink" className="flex-1">
              {COPY.type}
            </Text>
            <Select
              value={type}
              open={typeOpen}
              onOpenChange={setTypeOpen}
              disabled={inert}
              onValueChange={(next) => {
                if (next !== type)
                  void save("type", { type: next as TodoType });
              }}
            >
              <SelectTrigger
                aria-label={COPY.typeName(typeOption.label)}
                className="w-fit min-h-(--target)"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="top" align="end">
                {TODO_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <TypeGlyph icon={option.icon} />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {failedLine("type")}

          <div className={ROW}>
            <Text as="span" variant="body" tone="ink" className="flex-1">
              {COPY.repeats}
            </Text>
            <Select
              value={repeatValue}
              open={repeatsOpen}
              onOpenChange={setRepeatsOpen}
              disabled={inert}
              onValueChange={(next) => {
                if (next === CUSTOM) {
                  setStep("custom");
                  return;
                }
                if (next === repeatValue) return;
                const rrule = repeatOptions[Number(next)]?.rrule ?? null;
                void save("repeats", { rrule });
              }}
            >
              <SelectTrigger
                ref={repeatsRef}
                aria-label={COPY.repeatsName(repeatLabel)}
                className="w-fit min-h-(--target)"
              >
                {/* A custom rule picks no row: Radix shows the placeholder. */}
                <SelectValue placeholder={repeatLabel}>
                  {repeatLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="top"
                align="end"
                className="w-64"
              >
                {repeatOptions.map((option, index) => (
                  <SelectItem key={option.label} value={String(index)}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value={CUSTOM}>
                  <span className="flex flex-1 items-center justify-between gap-(--space-2)">
                    {COPY.custom}
                    <DisclosureIcon
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                  </span>
                </SelectItem>
                <Text
                  as="p"
                  variant="caption"
                  tone="muted"
                  className="px-(--space-2) py-(--space-2)"
                >
                  {COPY.repeatsNote}
                </Text>
              </SelectContent>
            </Select>
          </div>
          {failedLine("repeats")}

          <ReminderRow
            availability={reminder.availability}
            known={reminder.known && !inert}
            remindOn={todo?.remindOn ?? null}
            remindAt={todo?.remindAt ?? null}
            todayKey={todayKey}
            onToggle={(on) => {
              if (!available) return;
              void save(
                "reminder",
                reminderSwitchWrite({
                  on,
                  nowMinutes: instantToWallClockMinutes(
                    source.now(),
                    source.scenario.records.timeZone,
                  ),
                  todayKey,
                  tomorrowKey: addDays(todayKey, 1),
                }),
              );
            }}
            onDay={(remindOn) => void save("reminder", { remindOn })}
            onPickDay={() => setStep("remind-on")}
            onTime={(remindAt) => {
              const patch = todo && reminderTimeWrite(remindAt, todo, todayKey);
              if (patch) void save("reminder", patch);
            }}
            onHow={onHow}
            onSettings={onSettings}
            failedLine={failedLine("reminder")}
          />

          <div className="flex flex-col gap-(--space-2) pt-(--space-3)">
            <Textarea
              label={COPY.notes}
              value={notes}
              autoGrow
              rows={2}
              disabled={inert}
              onChange={(event) => setNotesDraft(event.target.value)}
              onBlur={commitNotes}
            />
            {failedLine("notes")}
          </div>
        </div>
      )}
    </ResponsiveSheet>
  );
}

/** The type's emoji in an 18 px slot; Other's is a small dot. */
function TypeGlyph({ icon }: { icon: IconValue | null }) {
  return (
    <span
      aria-hidden="true"
      className="font-emoji inline-flex size-4.5 shrink-0 items-center justify-center"
    >
      {icon?.kind === "emoji" ? (
        icon.value
      ) : (
        <span className="bg-muted-foreground size-1 rounded-full" />
      )}
    </span>
  );
}
