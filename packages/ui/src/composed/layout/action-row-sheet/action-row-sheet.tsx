/**
 * ActionRowSheet — a sheet that is a list of actions (v2 handoff §5.6).
 *
 * DH-01's day options. A `ResponsiveSheet` preset: title, optional subtitle,
 * N 56px rows, and a *Close*. Rows the current day state does not offer are
 * `hidden`, not disabled — a closed day has no *Shift the day*, and showing it
 * greyed out invites a person to work out why.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { ResponsiveSheet } from "../responsive-sheet";

export interface ActionRow {
  label: string;
  onSelect: () => void;
  hidden?: boolean;
}

export interface ActionRowSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  rows: readonly ActionRow[];
  closeLabel: string;
  className?: string;
}

export function ActionRowSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  rows,
  closeLabel,
  className,
}: ActionRowSheetProps) {
  const visible = rows.filter((row) => row.hidden !== true);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={subtitle}
      className={className}
      footer={
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          {closeLabel}
        </Button>
      }
    >
      <ul className="divide-hairline flex flex-col divide-y">
        {visible.map((row) => (
          <li key={row.label}>
            <button
              type="button"
              onClick={() => {
                row.onSelect();
                onOpenChange(false);
              }}
              className={cn(
                "flex min-h-(--row-min) w-full items-center px-(--space-2) text-left",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
              )}
            >
              <Text as="span" variant="row-title" weight={500}>
                {row.label}
              </Text>
            </button>
          </li>
        ))}
      </ul>
    </ResponsiveSheet>
  );
}
