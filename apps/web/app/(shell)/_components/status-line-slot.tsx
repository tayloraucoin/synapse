/**
 * StatusLineSlot — the shell's one status line, resolved (v2 handoff §5.2).
 *
 * PRIORITY, IN THIS ORDER: offline > setup > pending review > late offer >
 * update > timezone > install. Exactly one line shows, ever. The order is the
 * component's whole job: several of these can be true at once, and a stack of
 * banners under the header is the thing the official spec's §9 quiet rules
 * exist to prevent.
 *
 * `offline` is first and never dismissable — a person needs to know their
 * changes are local before they read anything else. `install` is last because
 * it is the only one that is a suggestion rather than a fact.
 *
 * Dismissals go through `useDismissed` with the scope each line deserves
 * (§12 call 12): setup for the session, the late offer for the day, install
 * forever.
 *
 * Phase 1 note: the sources are props. The hooks that will supply them —
 * pending count, setup state, late-offer eligibility — arrive with the epics
 * that own that data; passing them in keeps this component a pure resolver
 * and lets it be storied.
 */
"use client";

import {
  InstallLine,
  PermissionLine,
  StatusLine,
  TimezoneLine,
  UpdateLine,
} from "@syn/ui";
import * as React from "react";

import { useDismissed } from "@/lib/hooks/use-dismissed";
import { useOnline } from "@/lib/hooks/use-online";

export interface StatusLineSlotProps {
  /** The day key in the day's zone — scopes the late offer's dismissal. */
  dayKey: string;
  setupIncomplete?: boolean;
  onFinishSetup?: () => void;
  reviewPending?: boolean;
  /**
   * Official spec §10.5's line, built by the caller because it names the day
   * and the count (`pendingReviewText`). Falls back to the copy table's
   * generic sentence when absent.
   */
  pendingText?: string;
  onOpenReview?: () => void;
  lateOffer?: boolean;
  onShiftDay?: () => void;
  updateReady?: boolean;
  onReload?: () => void;
  timezoneMismatch?: { deviceZone: string; storedZone: string };
  onSwitchZone?: () => void;
  installOffer?: boolean;
  onHowToInstall?: () => void;
  permissionOffer?: boolean;
  onTurnOnReminders?: () => void;
}

export function StatusLineSlot({
  dayKey,
  setupIncomplete = false,
  onFinishSetup,
  reviewPending = false,
  pendingText,
  onOpenReview,
  lateOffer = false,
  onShiftDay,
  updateReady = false,
  onReload,
  timezoneMismatch,
  onSwitchZone,
  installOffer = false,
  onHowToInstall,
  permissionOffer = false,
  onTurnOnReminders,
}: StatusLineSlotProps) {
  const online = useOnline();

  const [setupDismissed, dismissSetup] = useDismissed("setup", "session");
  const [lateDismissed, dismissLate] = useDismissed(
    "late-offer",
    "day",
    dayKey,
  );
  const [zoneDismissed, dismissZone] = useDismissed("timezone", "day", dayKey);
  const [installDismissed, dismissInstall] = useDismissed("install", "forever");
  const [permissionDismissed, dismissPermission] = useDismissed(
    "permission",
    "forever",
  );

  if (!online) return <StatusLine variant="offline" />;

  if (setupIncomplete && !setupDismissed && onFinishSetup !== undefined) {
    return (
      <StatusLine
        variant="setup"
        action={{ label: "Finish", onClick: onFinishSetup }}
        onDismiss={dismissSetup}
      />
    );
  }

  if (reviewPending && onOpenReview !== undefined) {
    return (
      <StatusLine
        variant="pending-review"
        text={pendingText}
        action={{ label: "Review", onClick: onOpenReview }}
      />
    );
  }

  if (lateOffer && !lateDismissed && onShiftDay !== undefined) {
    return (
      <StatusLine
        variant="late-offer"
        action={{ label: "Adjust the morning", onClick: onShiftDay }}
        onDismiss={dismissLate}
      />
    );
  }

  if (updateReady && onReload !== undefined) {
    return <UpdateLine onReload={onReload} />;
  }

  if (
    timezoneMismatch !== undefined &&
    !zoneDismissed &&
    onSwitchZone !== undefined
  ) {
    return (
      <TimezoneLine
        deviceZone={timezoneMismatch.deviceZone}
        storedZone={timezoneMismatch.storedZone}
        onSwitch={onSwitchZone}
        onDismiss={dismissZone}
      />
    );
  }

  if (installOffer && !installDismissed && onHowToInstall !== undefined) {
    return <InstallLine onHow={onHowToInstall} onDismiss={dismissInstall} />;
  }

  if (
    permissionOffer &&
    !permissionDismissed &&
    onTurnOnReminders !== undefined
  ) {
    return (
      <PermissionLine
        onTurnOn={onTurnOnReminders}
        onDismiss={dismissPermission}
      />
    );
  }

  return null;
}
