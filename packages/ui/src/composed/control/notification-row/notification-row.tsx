/**
 * NotificationRow — a switch row with an optional inline time (v2 handoff §5.5).
 *
 * Adapted from CC's `notification-toggles`: `Label htmlFor` + a description
 * with an id + `Switch aria-describedby`, and CC's retry line on a failed
 * save — *That didn't save — flip it again to retry.* The switch is the retry
 * affordance, so there is no second button to find.
 *
 * The time control appears only while the switch is on. A disabled time field
 * under an off switch is furniture; hiding it makes the row's state readable
 * at a glance.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Switch } from "../../../primitives/control/switch";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { TimeField } from "../time-field";

export type NotificationRowValue =
  | { kind: "time"; value: string; onChange: (value: string) => void }
  | {
      kind: "day-time";
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      time: string;
      onChange: (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, time: string) => void;
    };

export interface NotificationRowProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  value?: NotificationRowValue;
  note?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function NotificationRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  value,
  note,
  error,
  disabled = false,
  className,
}: NotificationRowProps) {
  const descriptionId = `${id}-description`;
  const message = error ?? note;

  return (
    <div
      className={cn(
        "flex flex-col gap-(--space-2) py-(--space-3)",
        className,
      )}
    >
      <div className="flex items-start gap-(--space-3)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
          <Text as="label" htmlFor={id} variant="body" weight={500}>
            {label}
          </Text>
          {description === undefined ? null : (
            <Text
              as="span"
              id={descriptionId}
              variant="secondary"
              tone="secondary"
            >
              {description}
            </Text>
          )}
        </div>

        <Switch
          id={id}
          checked={checked}
          disabled={disabled}
          aria-describedby={description === undefined ? undefined : descriptionId}
          onCheckedChange={onCheckedChange}
          className="mt-(--space-1) shrink-0"
        />
      </div>

      {checked && value !== undefined ? (
        <div className="flex flex-wrap items-end gap-(--space-3) ps-(--space-1)">
          {value.kind === "day-time" ? (
            <label className="flex flex-col gap-(--space-1)">
              <Text as="span" variant="secondary" weight={500}>
                Day
              </Text>
              <select
                value={value.day}
                disabled={disabled}
                onChange={(event) =>
                  value.onChange(
                    Number.parseInt(event.target.value, 10) as 0,
                    value.time,
                  )
                }
                className="border-hairline bg-paper text-ink h-(--target) rounded-(--radius) border px-(--space-2)"
              >
                {DAY_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <TimeField
            label="Time"
            value={value.kind === "time" ? value.value : value.time}
            disabled={disabled}
            onChange={(next) => {
              if (value.kind === "time") value.onChange(next);
              else value.onChange(value.day, next);
            }}
          />
        </div>
      ) : null}

      {message === undefined ? null : (
        <HelperText error={error !== undefined}>{message}</HelperText>
      )}
    </div>
  );
}
