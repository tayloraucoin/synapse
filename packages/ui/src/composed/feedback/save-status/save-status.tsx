/**
 * SaveStatusText — the autosave word in a canvas header (v2 handoff §5.3).
 *
 * Adapted from CC's `AutosaveBanner`: the same state union and the same quiet
 * `role="status"` text, at caption size in the header rather than as a band.
 *
 * NAMED `SaveStatusText`, not `SaveStatus`: `SaveStatus` is the type in
 * `@syn/types`, and a component sharing that identifier would make every file
 * that wants both import one of them under an alias.
 *
 * `retrying` and `failed` read in `ink` — the same weight as the rest of the
 * header, never a colour. Official spec §9.3: nothing amber or red, and the
 * words carry the state.
 */
"use client";

import type { SaveStatus } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { SAVE_STATUS_COPY } from "./copy";

export interface SaveStatusTextProps {
  status: SaveStatus;
  onRetry?: () => void;
  className?: string;
}

export function SaveStatusText({
  status,
  onRetry,
  className,
}: SaveStatusTextProps) {
  const text = SAVE_STATUS_COPY[status];
  if (text === null) return null;

  const urgent = status === "retrying" || status === "failed";

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-(--space-2)", className)}
    >
      <Text as="span" variant="caption" tone={urgent ? "ink" : "secondary"}>
        {text}
      </Text>
      {status === "failed" && onRetry !== undefined ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </span>
  );
}
