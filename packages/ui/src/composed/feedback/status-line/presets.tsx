/**
 * StatusLine presets — v2 handoff §5.10.
 *
 * `UpdateLine`, `TimezoneLine`, `InstallLine`, `PermissionLine`. Each fixes
 * the variant, the copy and the dismissability of one system line, so the
 * shell's slot chooses a component rather than assembling props. SY-02's
 * update line, for instance, has no dismiss control at all — expressing that
 * as "the caller happens not to pass onDismiss" is how it eventually gets one.
 */
"use client";

import * as React from "react";

import { STATUS_LINE_COPY, timezoneMismatchText } from "./copy";
import { StatusLine } from "./status-line";

export interface UpdateLineProps {
  onReload: () => void;
  className?: string;
}

/** SY-02 — non-dismissable by design; it never interrupts, it just waits. */
export function UpdateLine({ onReload, className }: UpdateLineProps) {
  return (
    <StatusLine
      variant="update"
      action={{
        label: STATUS_LINE_COPY.update.actionLabel ?? "Reload",
        onClick: onReload,
      }}
      className={className}
    />
  );
}

export interface TimezoneLineProps {
  deviceZone: string;
  storedZone: string;
  onSwitch: () => void;
  onDismiss: () => void;
  className?: string;
}

/** SY-06 — names both zones, so the person can tell which is which. */
export function TimezoneLine({
  deviceZone,
  storedZone,
  onSwitch,
  onDismiss,
  className,
}: TimezoneLineProps) {
  return (
    <StatusLine
      variant="timezone"
      text={timezoneMismatchText(deviceZone, storedZone)}
      action={{
        label: STATUS_LINE_COPY.timezone.actionLabel ?? "Switch",
        onClick: onSwitch,
      }}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

export interface InstallLineProps {
  onHow: () => void;
  onDismiss: () => void;
  className?: string;
}

/** SY-07 — offered once, after the third reviewed day; dismiss never returns. */
export function InstallLine({ onHow, onDismiss, className }: InstallLineProps) {
  return (
    <StatusLine
      variant="install"
      action={{
        label: STATUS_LINE_COPY.install.actionLabel ?? "How",
        onClick: onHow,
      }}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

export interface PermissionLineProps {
  onTurnOn: () => void;
  onDismiss: () => void;
  className?: string;
}

/** The fallback ask — the in-context sheet is the first-choice surface. */
export function PermissionLine({
  onTurnOn,
  onDismiss,
  className,
}: PermissionLineProps) {
  return (
    <StatusLine
      variant="permission"
      action={{
        label: STATUS_LINE_COPY.permission.actionLabel ?? "Turn on",
        onClick: onTurnOn,
      }}
      onDismiss={onDismiss}
      className={className}
    />
  );
}
