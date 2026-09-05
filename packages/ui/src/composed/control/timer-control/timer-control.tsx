/**
 * TimerControl — two buttons in fixed positions (v2 handoff §5.6).
 *
 * [Start | —] → [Pause | Stop] → [Resume | Stop]. The positions never move:
 * the left slot is always the go/hold action and the right slot is always
 * Stop, so a person who has used it once can hit the right button without
 * reading. A control that reorders itself between states is how someone stops
 * a timer they meant to pause.
 *
 * Pause is Phase 2 (`pauseEnabled`); until then the left slot goes
 * Start → (nothing, the timer is running) and Stop ends it.
 */
"use client";

import type { TimerStatus } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";

export interface TimerControlProps {
  status: TimerStatus;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop: () => void;
  /** Phase 2. */
  pauseEnabled?: boolean;
  busy?: boolean;
  className?: string;
}

export function TimerControl({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  pauseEnabled = false,
  busy = false,
  className,
}: TimerControlProps) {
  const primary =
    status === "idle"
      ? { label: "Start", onClick: onStart }
      : status === "paused"
        ? { label: "Resume", onClick: onResume ?? onStart }
        : pauseEnabled && onPause !== undefined
          ? { label: "Pause", onClick: onPause }
          : null;

  return (
    <div
      role="group"
      aria-label="Timer"
      className={cn("flex items-center gap-(--space-2)", className)}
    >
      <div className="flex-1">
        {primary === null ? null : (
          <Button
            variant={status === "running" ? "secondary" : "default"}
            busy={busy}
            onClick={primary.onClick}
            className="w-full"
          >
            {primary.label}
          </Button>
        )}
      </div>
      <div className="flex-1">
        {status === "idle" ? null : (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={onStop}
            className="w-full"
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
