"use client";

/**
 * EventPopover (USE-53; interactions/add-event.md): the desk's Add event,
 * a popover under a day head's "+ Event" (D-USE-41), 340 wide at the sheet
 * radius with the soft shadow. "New event · Wednesday 14"; the name with
 * its emoji slot; Starts and Ends, each a time field with − +; Work or
 * Personal; Client with its letter tile, for a Work event when clients are
 * on (D-USE-95); Repeats, the New block sheet's options (USE-46); a rule,
 * the landing line, and Add event, full width in ink (D-USE-102, as drawn).
 *
 * A modal popover traps focus; focus starts in the name and goes back to
 * "+ Event" on close; Esc closes with nothing added. The landing line is
 * tied to Add by `aria-describedby` and announced politely. The Week mounts
 * it on its day heads; until then `/dev/parts?state=event-popover`.
 */
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TimeField,
} from "@syn/ui";
import type { RepeatPreset } from "@syn/utils";
import { ClientTile } from "@/components/work/client-tile";
import type { WeekRef } from "@/lib/data/week-records";
import { repeatOptions } from "../new-block-sheet/form";
import type { EventDone } from "./add-event-sheet";
import { clock, ADD_EVENT_COPY as COPY } from "./copy";
import { AddButton, LandingText, NameField, TagField } from "./fields";
import {
  addedWords,
  EVENT_STEP_MIN,
  hasName,
  landingLine,
  openForm,
  reduceForm,
  refusalOf,
  stepTime,
  type AddEventAction,
  type AddEventForm,
} from "./form";
import { useAddEvent } from "./use-add-event";

export interface EventPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: { week: WeekRef; day: number };
  start: Partial<AddEventForm> & { startsAt: string };
  /** The day head's "+ Event", which the popover hangs under. */
  trigger: React.ReactNode;
  onDone: (done: EventDone) => void;
}

const NO_CLIENT = "none";

export function EventPopover({
  open,
  onOpenChange,
  target,
  start,
  trigger,
  onDone,
}: EventPopoverProps) {
  const { day, clients, add } = useAddEvent(open ? target : null);
  const [form, setForm] = React.useState<AddEventForm | null>(null);
  const [sending, setSending] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const ids = { name: React.useId(), line: React.useId() };

  const startRef = React.useRef(start);
  startRef.current = start;
  React.useEffect(() => {
    setForm(open ? openForm(startRef.current) : null);
  }, [open]);

  // Focus in the name once the day is read and the form is there.
  const ready = open && form !== null && day !== null;
  React.useEffect(() => {
    if (ready) nameRef.current?.focus();
  }, [ready]);

  const set = (action: AddEventAction) =>
    setForm((current) =>
      current === null ? null : reduceForm(current, action),
    );

  async function send(current: AddEventForm) {
    if (day === null || sending) return;
    if (!hasName(current) || refusalOf(current, day.date) !== null) return;
    setSending(true);
    try {
      const added = await add(current);
      onDone({ words: addedWords(current, added.landing), undo: added.undo });
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  }

  const client = clients.find((c) => c.id === form?.clientId) ?? null;
  const options = day === null ? [] : repeatOptions(day.date);

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-85 flex-col gap-(--space-3) rounded-(--radius-sheet) shadow-menu"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameRef.current?.focus();
        }}
        aria-label={
          day === null ? COPY.addEvent : COPY.newEvent(day.weekday, day.date)
        }
      >
        {form === null || day === null ? null : (
          <>
            <Text as="h2" variant="body" weight={600}>
              <label htmlFor={ids.name}>
                {COPY.newEvent(day.weekday, day.date)}
              </label>
            </Text>
            <NameField
              id={ids.name}
              form={form}
              inputRef={nameRef}
              onTitle={(title) => set({ type: "title", title })}
              onEnter={() => void send(form)}
            />
            <div className="grid grid-cols-2 gap-(--space-3)">
              <TimeStep
                label={COPY.starts}
                value={form.startsAt}
                onChange={(startsAt) => set({ type: "starts", startsAt })}
              />
              <TimeStep
                label={COPY.ends}
                value={form.endsAt === "24:00" ? "23:59" : form.endsAt}
                onChange={(endsAt) => set({ type: "ends", endsAt })}
              />
            </div>
            <TagField
              labelled={false}
              value={form.tag}
              onChange={(tag) => set({ type: "tag", tag })}
            />
            {form.tag === "work" && clients.length > 0 ? (
              <div className="flex items-center justify-between gap-(--space-3)">
                <Text as="span" variant="secondary" tone="secondary">
                  {COPY.client}
                </Text>
                <Select
                  value={form.clientId ?? NO_CLIENT}
                  onValueChange={(next) =>
                    set({
                      type: "client",
                      clientId: next === NO_CLIENT ? null : next,
                    })
                  }
                >
                  <SelectTrigger
                    aria-label={`${COPY.client}, ${client?.name ?? COPY.noClient}`}
                    className="min-h-(--target) w-fit border-0 shadow-none"
                  >
                    <SelectValue>
                      {client === null ? (
                        COPY.noClient
                      ) : (
                        <span className="flex items-center gap-(--space-2)">
                          <ClientTile letter={client.letter} hue={client.hue} />
                          {client.name}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    {clients.map((each) => (
                      <SelectItem key={each.id} value={each.id}>
                        <span className="flex items-center gap-(--space-2)">
                          <ClientTile letter={each.letter} hue={each.hue} />
                          {each.name}
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value={NO_CLIENT}>{COPY.noClient}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-(--space-3)">
              <Text as="span" variant="secondary" tone="secondary">
                {COPY.repeats}
              </Text>
              <Select
                value={form.repeat}
                onValueChange={(next) =>
                  set({ type: "repeat", repeat: next as RepeatPreset })
                }
              >
                <SelectTrigger
                  aria-label={`${COPY.repeats}, ${options.find((o) => o.preset === form.repeat)?.label ?? COPY.doesNotRepeat}`}
                  className="min-h-(--target) w-fit border-0 shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-72">
                  {options.map((option) => (
                    <SelectItem key={option.preset} value={option.preset}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <LandingText
              id={ids.line}
              line={landingLine(form, day, "desk")}
              className="border-hairline border-t pt-(--space-3)"
            />
            <AddButton
              named={hasName(form)}
              label={COPY.addEvent}
              lineId={ids.line}
              onAdd={() => void send(form)}
              className="h-10"
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** A labelled time field with − + beside it, each stepping 15 minutes. */
function TimeStep({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-(--space-1)">
      <TimeField
        label={
          <Text as="span" variant="caption" tone="secondary">
            {label}
          </Text>
        }
        name={label}
        value={value}
        formatValue={clock}
        onChange={onChange}
      />
      <div className="flex justify-end gap-(--space-1)">
        <StepButton
          name={COPY.earlier(label)}
          glyph="−"
          onClick={() => onChange(stepTime(value, -EVENT_STEP_MIN))}
        />
        <StepButton
          name={COPY.later(label)}
          glyph="+"
          onClick={() => onChange(stepTime(value, EVENT_STEP_MIN))}
        />
      </div>
    </div>
  );
}

function StepButton({
  name,
  glyph,
  onClick,
}: {
  name: string;
  glyph: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={name}
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-(--radius-control) outline-none focus-visible:ring-2"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
