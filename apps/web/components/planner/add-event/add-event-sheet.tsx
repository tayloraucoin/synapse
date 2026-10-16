"use client";

/**
 * AddEventSheet (USE-53; set-my-days/states/add-event.md): the phone's Add
 * event, "this date only", from Set my days' + › Event. A `ResponsiveSheet`
 * as the New block sheet: × and "Mon 12 · this date only" over the title;
 * Name with its emoji slot; Tag, Work or Personal; then 56 px rows, Starts,
 * Length (− 30 min +) and Colour (plum, "Plum, for events"); Notes; at the
 * foot the landing line and Add event (D-USE-102, as drawn).
 *
 * The time decides where it lands, and the line above Add says where and
 * what moves, changing with every field (`form.ts`). No name is "Name
 * needed" on faded ink; Ends before Starts is refused in ink, in the
 * schema's words. × or a swipe down closes with nothing added.
 *
 * A Synapse event tapped in the column opens here filled (D-USE-42), titled
 * with its name, with Save and Delete event [ASSUMPTION: as add-event.md's
 * Rules]. Nothing is written to Google.
 */
import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  MinutesStepper,
  NotSavedIcon,
  ResponsiveSheet,
  Text,
  Textarea,
  TimeField,
} from "@syn/ui";
import type { WeekRef } from "@/lib/data/week-records";
import { HUE_DOT } from "../block-hue";
import { IconPickerStep } from "../icon-picker-step";
import { clock, ADD_EVENT_COPY as COPY } from "./copy";
import { AddButton, LandingText, NameField, TagField } from "./fields";
import {
  addedWords,
  EVENT_STEP_MIN,
  hasName,
  landingLine,
  lengthMin,
  openForm,
  reduceForm,
  refusalOf,
  type AddEventAction,
  type AddEventForm,
} from "./form";
import { useAddEvent } from "./use-add-event";

/** What the sheet hands back once it has written: the words and their Undo. */
export interface EventDone {
  words: string;
  undo: string;
}

export interface AddEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The dated day it adds to: This week's, Monday 0. */
  target: { week: WeekRef; day: number };
  /** Where it starts: a time, or a Synapse event's fields to edit. */
  start: Partial<AddEventForm> & { startsAt: string };
  /** Sends the add once on open (`?state=`'s staged add). */
  addOnOpen?: boolean;
  onDone: (done: EventDone) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const ROW =
  "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-t";

type Step = "fields" | "icon";

export function AddEventSheet({
  open,
  onOpenChange,
  target,
  start,
  addOnOpen = false,
  onDone,
  returnFocusRef,
}: AddEventSheetProps) {
  const { day, add, remove } = useAddEvent(open ? target : null);
  const [form, setForm] = React.useState<AddEventForm | null>(null);
  const [step, setStep] = React.useState<Step>("fields");
  const [failed, setFailed] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const iconRef = React.useRef<HTMLButtonElement>(null);
  const ids = { name: React.useId(), line: React.useId() };

  // A fresh form each opening, from its start.
  const startRef = React.useRef(start);
  startRef.current = start;
  React.useEffect(() => {
    if (!open) {
      setForm(null);
      setStep("fields");
      setFailed(false);
      return;
    }
    setForm((current) => current ?? openForm(startRef.current));
  }, [open]);

  // Focus in the name once the sheet's content is there (the New block sheet's wait).
  const ready = form !== null && day !== null;
  React.useEffect(() => {
    if (!ready || step !== "fields") return;
    let tries = 0;
    let timer = 0;
    const focusName = () => {
      const field = nameRef.current;
      if (field === null) {
        tries += 1;
        if (tries < 20) timer = window.setTimeout(focusName, 50);
        return;
      }
      field.focus();
    };
    timer = window.setTimeout(focusName, 50);
    return () => window.clearTimeout(timer);
  }, [ready, step]);

  async function send(current: AddEventForm) {
    if (day === null || sending) return;
    if (!hasName(current) || refusalOf(current, day.date) !== null) return;
    setSending(true);
    setFailed(false);
    try {
      const added = await add(current);
      const words =
        current.id === null
          ? addedWords(current, added.landing)
          : COPY.saved(current.title.trim());
      onDone({ words, undo: added.undo });
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  async function deleteEvent(current: AddEventForm) {
    if (current.id === null) return;
    try {
      const removed = await remove(current.id);
      onDone({ words: COPY.deleted(current.title.trim()), undo: removed.undo });
      onOpenChange(false);
    } catch {
      setFailed(true);
    }
  }

  // A capture's staged add, once the sheet has its day.
  const sendNow = React.useRef(() => {});
  sendNow.current = () => {
    if (form !== null) void send(form);
  };
  const staged = React.useRef(false);
  React.useEffect(() => {
    if (!open) {
      staged.current = false;
      return;
    }
    if (!ready || !addOnOpen || staged.current) return;
    staged.current = true;
    sendNow.current();
  }, [open, ready, addOnOpen]);

  if (form === null || day === null) return null;

  const set = (action: AddEventAction) => {
    setFailed(false);
    setForm((current) =>
      current === null ? null : reduceForm(current, action),
    );
  };

  const editing = form.id !== null;
  const title = editing ? form.title.trim() || COPY.addEvent : COPY.addEvent;
  const named = hasName(form);
  const line = landingLine(form, day, "phone");

  const header =
    step !== "fields" ? (
      <span className="sr-only">{title}</span>
    ) : (
      <div className="flex min-w-0 flex-1 items-start gap-(--space-2)">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => onOpenChange(false)}
          className="-ms-(--space-3)"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
        <div className="flex min-w-0 flex-col pt-(--space-1) pb-(--space-3)">
          <Text as="p" variant="caption" tone="secondary">
            {COPY.scope(day.weekday, day.date)}
          </Text>
          <Text as="h2" variant="heading">
            {title}
          </Text>
        </div>
      </div>
    );

  const footer =
    step !== "fields" ? undefined : (
      <div className="flex flex-col gap-(--space-3)">
        {failed ? (
          <p className="flex items-center gap-(--space-2)">
            <NotSavedIcon
              aria-hidden="true"
              className="text-ink size-4 shrink-0"
            />
            <Text as="span" variant="secondary" tone="ink">
              {COPY.notAdded}{" "}
              <button
                type="button"
                onClick={() => void send(form)}
                className="inline-flex min-h-(--target) items-center font-medium underline underline-offset-4"
              >
                {COPY.tryAgain}
              </button>
            </Text>
          </p>
        ) : (
          <LandingText id={ids.line} line={line} />
        )}
        <AddButton
          named={named}
          label={editing ? COPY.save : COPY.addEvent}
          lineId={ids.line}
          onAdd={() => void send(form)}
          className="h-12"
        />
        {editing ? (
          <Button
            variant="ghost"
            className="h-12 w-full"
            onClick={() => void deleteEvent(form)}
          >
            {COPY.deleteEvent}
          </Button>
        ) : null}
      </div>
    );

  const minutes = lengthMin(form);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      header={header}
      headerAction={null}
      footer={footer}
      size="tall"
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      classes={{
        header: step !== "fields" ? "hidden" : "items-start pt-(--space-2)",
        body: "pt-0",
        footer: "border-t-0",
      }}
    >
      {step === "icon" ? (
        <IconPickerStep
          name={form.title}
          value={form.icon}
          backLabel={form.title.trim() || title}
          onBack={() => {
            setStep("fields");
            requestAnimationFrame(() => iconRef.current?.focus());
          }}
          onPick={(icon) => {
            set({ type: "icon", icon });
            setStep("fields");
          }}
          onRecolour={(icon) => set({ type: "icon", icon })}
        />
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-col gap-(--space-2) pb-(--space-3)">
            <Text
              as="label"
              htmlFor={ids.name}
              variant="secondary"
              tone="secondary"
            >
              {COPY.name}
            </Text>
            <NameField
              id={ids.name}
              form={form}
              inputRef={nameRef}
              iconRef={iconRef}
              onTitle={(next) => set({ type: "title", title: next })}
              onIcon={() => setStep("icon")}
              onEnter={() => void send(form)}
            />
          </div>

          <div className="pb-(--space-3)">
            <TagField
              value={form.tag}
              onChange={(tag) => set({ type: "tag", tag })}
            />
          </div>

          <div className={ROW}>
            <Text as="span" variant="body" className="flex-1">
              {COPY.starts}
            </Text>
            <div className="w-36 shrink-0">
              <TimeField
                label={<span className="sr-only">{COPY.starts}</span>}
                value={form.startsAt}
                formatValue={clock}
                onChange={(startsAt) => set({ type: "starts", startsAt })}
              />
            </div>
          </div>

          <div className={ROW}>
            <Text as="span" variant="body" className="flex-1">
              {COPY.length}
            </Text>
            <div className="shrink-0">
              <MinutesStepper
                label={<span className="sr-only">{COPY.length}</span>}
                value={minutes}
                min={EVENT_STEP_MIN}
                max={24 * 60 - 1}
                step={EVENT_STEP_MIN}
                stepLabels={{ decrease: COPY.shorter, increase: COPY.longer }}
                onChange={(next) => set({ type: "length", lengthMin: next })}
              />
            </div>
          </div>

          <div className={ROW}>
            <Text as="span" variant="body" className="flex-1">
              {COPY.colour}
            </Text>
            <span
              role="img"
              aria-label={COPY.colourName}
              className="flex items-center gap-(--space-2)"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "ring-ink ring-offset-background size-5 rounded-full ring-1 ring-offset-2",
                  HUE_DOT.plum,
                )}
              />
              <Text
                as="span"
                variant="secondary"
                tone="secondary"
                aria-hidden="true"
              >
                {COPY.plum}
              </Text>
            </span>
          </div>

          <div className="flex flex-col gap-(--space-2) pt-(--space-3)">
            <Textarea
              label={COPY.notes}
              value={form.notes}
              rows={2}
              onChange={(event) =>
                set({ type: "notes", notes: event.target.value })
              }
            />
          </div>
        </div>
      )}
    </ResponsiveSheet>
  );
}
