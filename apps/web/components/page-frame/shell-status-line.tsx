"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { pendingReviewText } from "@syn/ui";

import { StatusLineSlot } from "@/app/(shell)/_components/status-line-slot";
import { ZoneSwitchDialog } from "@/components/zone-switch-dialog";
import { useDeviceZone } from "@/lib/hooks/use-device-zone";
import { useDismissed } from "@/lib/hooks/use-dismissed";
import { trpc } from "@/lib/trpc/client";
import { reviewDayRoute, setupRoute } from "@/lib/routes";

/**
 * The shell's status line, with its sources attached.
 *
 * `StatusLineSlot` is the pure resolver — it decides WHICH line wins. This is
 * the thin layer that tells it what is true, and it exists so the resolver
 * stays storyable and the sources stay replaceable: `lateOffer`,
 * `updateReady`, `timezoneMismatch`, `installOffer` and `permissionOffer` are
 * constants today and become real in USE-6, SYS-5 and SET-9. The props are
 * wired now so those tickets change one line each rather than this file's
 * shape.
 *
 * A FAILED QUERY IS NO LINE, NOT AN ERROR. The chrome is never load-bearing:
 * if `shell.status` is unavailable the page still renders, without a dot and
 * without a line.
 *
 * The pending line's own text is built here rather than taken from the copy
 * table, because official spec §10.5's sentence names the day and the count.
 *
 * THE MISMATCH COMPARES THE DEVICE ZONE WITH `shell.status.timezone` (SYS-2),
 * the effective STORED zone — not with the day being viewed. The header's zone
 * label answers a different question ("what zone is this day's record in") and
 * compares against the day's own snapshot, which is why a past day lived
 * elsewhere carries a label at home and raises no status line.
 *
 * IT IS SUPPRESSED WHILE FIRST RUN IS OWED. FR-01 sets the zone, so *Synapse is
 * on {stored}* would be reporting a default nobody chose, offering to switch
 * away from it two screens before the sequence asks. The slot already ranks the
 * setup line above this one; the guard covers the case where setup has been
 * dismissed for the session and the mismatch would surface behind it.
 */
export function ShellStatusLine({ dayKey }: { dayKey?: string }) {
  const router = useRouter();
  const deviceZone = useDeviceZone();
  const [zoneDialogOpen, setZoneDialogOpen] = React.useState(false);
  const [zoneSwitched, setZoneSwitched] = React.useState(false);
  const { data } = trpc.shell.status.useQuery(undefined, {
    // The chrome must never take the page down with it.
    retry: false,
  });

  // A day route scopes the late offer to the day being viewed; every other
  // route scopes it to today. Pages do not plumb this, and the hook below
  // needs it before the query has answered.
  const scopeKey = dayKey ?? data?.todayKey ?? "";

  /*
   * A SWITCH DOES NOT END THE MISMATCH — it defers one to tomorrow. *Switch*
   * writes the PENDING zone, so `users.timezone` is still the old one and the
   * comparison is still true; without this the line would reappear the moment
   * the query refetched, offering to do again the thing that was just done.
   * The storage write is the same day-scoped dismissal the line's own X makes,
   * so a reload before midnight stays quiet too.
   */
  const [, dismissZone] = useDismissed("timezone", "day", scopeKey);

  if (!data) return null;

  const [firstPending] = data.pendingDays;

  /*
   * Null before hydration, and null in an embed where `Intl` will not answer —
   * both mean "no claim", and no claim is no line.
   */
  const timezoneMismatch =
    deviceZone !== null &&
    deviceZone !== data.timezone &&
    !data.setupIncomplete &&
    !zoneSwitched
      ? { deviceZone, storedZone: data.timezone }
      : undefined;

  return (
    <>
    <StatusLineSlot
      dayKey={scopeKey}
      setupIncomplete={data.setupIncomplete}
      onFinishSetup={() => {
        router.push(setupRoute(data.setupStep ?? 1));
      }}
      reviewPending={firstPending !== undefined}
      pendingText={
        firstPending === undefined
          ? undefined
          : pendingReviewText(firstPending.weekday, firstPending.count)
      }
      onOpenReview={
        firstPending === undefined
          ? undefined
          : () => {
              router.push(reviewDayRoute(firstPending.date));
            }
      }
      lateOffer={false}
      updateReady={false}
      timezoneMismatch={timezoneMismatch}
      onSwitchZone={() => {
        setZoneDialogOpen(true);
      }}
      installOffer={false}
      permissionOffer={false}
    />

    {timezoneMismatch === undefined ? null : (
      <ZoneSwitchDialog
        open={zoneDialogOpen}
        deviceZone={timezoneMismatch.deviceZone}
        storedZone={timezoneMismatch.storedZone}
        onOpenChange={setZoneDialogOpen}
        onSwitched={() => {
          setZoneSwitched(true);
          dismissZone();
        }}
      />
    )}
    </>
  );
}
