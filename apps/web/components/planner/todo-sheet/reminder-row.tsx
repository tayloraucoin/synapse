"use client";

import * as React from "react";
import {
  Button,
  InstallNeededIcon,
  NotificationsOffIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Text,
  TimeField,
} from "@syn/ui";
import { addDays } from "@syn/utils";
import type { ReminderAvailability } from "@/lib/pwa/reminder-availability";
import { TODO_SHEET_COPY as COPY } from "./copy";

/**
 * ReminderRow — the To-do sheet's Reminder and, on, its At row (USE-28;
 * reminder-on.md, not-installed.md, notifications-off.md).
 *
 * THE SWITCH ONLY WHERE A REMINDER CAN ARRIVE. In an iPhone browser the row
 * reads "Reminders need the installed app." with How; installed with
 * notifications off, "Notifications are off for Synapse." with Settings.
 * The line is the row's description, so the button is read with its reason.
 * A reminder already set keeps its day and time meanwhile [ASSUMPTION,
 * notifications-off.md].
 *
 * The day is `remindOn` and the time `remindAt`, wall-clock, never an
 * instant. The day select reads Today, Tomorrow, then Pick a day… (D-USE-69),
 * which opens the month as a step (USE-29); a reminder on another date shows
 * that date as its own option above it.
 */
export interface ReminderRowProps {
  availability: ReminderAvailability;
  /** False until the device is read: the row shows no control. */
  known: boolean;
  remindOn: string | null;
  remindAt: string | null;
  todayKey: string;
  onToggle: (on: boolean) => void;
  onDay: (dateKey: string) => void;
  /** Pick a day…: the month step, for the reminder's day. */
  onPickDay: () => void;
  onTime: (time: string) => void;
  onHow: (opener: HTMLElement) => void;
  onSettings: () => void;
  /** "Not saved. Try again." under the row, when its last change failed. */
  failedLine?: React.ReactNode;
}

/** The select's value for Pick a day…, never a day key. */
const PICK_A_DAY = "pick-a-day";

const ROW = "flex min-h-(--row-min) items-center gap-(--space-3)";

export function ReminderRow({
  availability,
  known,
  remindOn,
  remindAt,
  todayKey,
  onToggle,
  onDay,
  onPickDay,
  onTime,
  onHow,
  onSettings,
  failedLine,
}: ReminderRowProps) {
  const ids = { label: React.useId(), line: React.useId() };
  const on = remindAt !== null;
  const tomorrowKey = addDays(todayKey, 1);
  const day = remindOn ?? todayKey;
  const dayLabel =
    day === todayKey
      ? COPY.today
      : day === tomorrowKey
        ? COPY.tomorrow
        : COPY.dayName(day);

  const reason =
    availability === "not-installed"
      ? { Icon: InstallNeededIcon, text: COPY.notInstalled }
      : availability === "notifications-off"
        ? { Icon: NotificationsOffIcon, text: COPY.notificationsOff }
        : null;

  return (
    <div className="border-hairline border-b">
      <div className={ROW}>
        <div className="flex min-w-0 flex-1 flex-col">
          <Text as="span" id={ids.label} variant="body" tone="ink">
            {COPY.reminder}
          </Text>
          {!known ? null : reason !== null ? (
            <Text
              as="span"
              id={ids.line}
              variant="secondary"
              tone="muted"
              className="flex items-center gap-(--space-1)"
            >
              <reason.Icon aria-hidden="true" className="size-3.5 shrink-0" />
              {reason.text}
            </Text>
          ) : (
            <Text as="span" id={ids.line} variant="secondary" tone="muted">
              {on ? COPY.reminderOn : COPY.reminderOff}
            </Text>
          )}
        </div>
        {!known ? null : availability === "available" ? (
          <Switch
            checked={on}
            onCheckedChange={onToggle}
            aria-labelledby={ids.label}
            aria-describedby={ids.line}
          />
        ) : (
          <Button
            variant="secondary"
            className="rounded-full"
            aria-label={
              availability === "not-installed"
                ? COPY.howName
                : COPY.settingsName
            }
            aria-describedby={ids.line}
            onClick={(event) =>
              availability === "not-installed"
                ? onHow(event.currentTarget)
                : onSettings()
            }
          >
            {availability === "not-installed" ? COPY.how : COPY.settings}
          </Button>
        )}
      </div>
      {on && known && availability === "available" ? (
        <div className={ROW}>
          <Text as="span" variant="body" tone="ink" className="flex-1">
            {COPY.at}
          </Text>
          <Select
            value={day}
            onValueChange={(next) =>
              next === PICK_A_DAY ? onPickDay() : onDay(next)
            }
          >
            <SelectTrigger
              aria-label={COPY.reminderDay(dayLabel)}
              className="min-h-(--target) w-fit"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="top" align="end">
              <SelectItem value={todayKey}>{COPY.today}</SelectItem>
              <SelectItem value={tomorrowKey}>{COPY.tomorrow}</SelectItem>
              {day !== todayKey && day !== tomorrowKey ? (
                <SelectItem value={day}>{dayLabel}</SelectItem>
              ) : null}
              <SelectItem value={PICK_A_DAY}>{COPY.pickADay}</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-32 shrink-0">
            <TimeField
              value={remindAt}
              onChange={(time) => {
                if (/^\d{2}:\d{2}$/.test(time) && time !== remindAt)
                  onTime(time);
              }}
              label={<span className="sr-only">{COPY.reminderTime}</span>}
            />
          </div>
        </div>
      ) : null}
      {failedLine}
    </div>
  );
}
