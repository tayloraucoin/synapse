"use client";

import * as React from "react";

import { ConfirmDialog } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import { ZONE_SWITCH_COPY as COPY } from "./copy";

/**
 * SY-06's dialog — the second half of the travelling status line
 * (cross-cutting §7.3, §10 SY-06).
 *
 * IT WRITES THE PENDING HALF, NOT THE ZONE. `pendingTimezone` alone; the date
 * it starts applying is computed on the server from the values the person is
 * still living in (SET-8), so no request can ask for a switch that lands today.
 * That is the whole reason the dialog can promise *Today stays on {stored}*
 * without the client having to be trusted about what "tomorrow" means.
 *
 * NOT DESTRUCTIVE. The destructive treatment in this app is Delete account and
 * nothing else (official spec §9.3) — and a zone switch is reversible by
 * switching back, deferred until tomorrow, and moves nothing that has happened.
 *
 * AN UNLISTED ZONE STILL WORKS. `timezoneSchema` accepts anything the runtime's
 * `Intl.supportedValuesOf("timeZone")` knows, not just the ids in
 * `TIMEZONE_REGIONS`, so a person in a city the picker has not heard of can
 * still switch to it from here — which is the one path that does not go through
 * the picker.
 *
 * A FAILED SAVE CLOSES NOTHING. The mismatch is still true, the line is still
 * the right thing to show, and the person can try again; the dialog is chrome,
 * and chrome that traps someone behind an error is worse than chrome that does
 * not mention it.
 */
export function ZoneSwitchDialog({
  open,
  deviceZone,
  storedZone,
  onOpenChange,
  onSwitched,
}: {
  open: boolean;
  deviceZone: string;
  storedZone: string;
  onOpenChange: (open: boolean) => void;
  onSwitched?: () => void;
}) {
  const utils = trpc.useUtils();
  const save = trpc.user.updatePreferences.useMutation();

  async function confirm(): Promise<void> {
    try {
      await save.mutateAsync({ pendingTimezone: deviceZone });
      await utils.shell.status.invalidate();
      await utils.user.me.invalidate();
      await utils.day.get.invalidate();
      onSwitched?.();
      onOpenChange(false);
    } catch {
      onOpenChange(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title(deviceZone)}
      description={COPY.description(deviceZone, storedZone)}
      cancelLabel={COPY.cancel}
      confirmLabel={COPY.confirm}
      busy={save.isPending}
      onConfirm={() => void confirm()}
    />
  );
}
