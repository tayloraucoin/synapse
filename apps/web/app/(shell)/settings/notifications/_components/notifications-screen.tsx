"use client";

import * as React from "react";

import {
  GroupHeading,
  HelperText,
  NotificationRow,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import { BLOCK_KIND_WORDS } from "@syn/constants";
import type { BlockKind, NotificationKind, PermissionState } from "@syn/types";

import { PlatformStepsSheet } from "@/components/platform-steps-sheet";
import { REMINDER_COPY as COPY } from "@/components/reminder-prompt";
import { useOnline } from "@/lib/hooks/use-online";
import { usePermissionState } from "@/lib/pwa/permission-state";
import { subscribeToPush } from "@/lib/pwa/push-subscribe";
import { trpc } from "@/lib/trpc/client";

/**
 * ST-07 — every reminder the product can send, each with its default.
 *
 * UX v1.1 §9 (DYN-20): the first group is the starts — each block, the pins
 * and fixtures, the devices-off marker; *Every item in…* is N1b as one
 * switch per block kind (R19: opt-in per block, off by default).
 *
 * ONLY PHASE-1 ROWS APPEAR. The server filters by the catalogue's `phase`, so
 * a switch is never shown for a sender that does not exist — somebody would
 * turn on *When a window opens*, receive nothing, and reasonably conclude the
 * whole feature is broken.
 *
 * THE TWO TIME VALUES ARE ACCOUNT SCALARS, not preferences. N4's time is
 * `users.review_reminder_time`, the same field ST-08 edits: one home, so the
 * two screens can never disagree about when the review reminder fires.
 *
 * THIS SCREEN IS THE ONLY PERMISSION SURFACE (SYS-1's ruling). The shell's
 * `PermissionLine` variant is deliberately unwired: a line about notifications
 * following someone across every screen is the nagging §8.5 forbids.
 */
export function NotificationsScreen() {
  const online = useOnline();
  const utils = trpc.useUtils();
  const { state, refresh } = usePermissionState();

  const prefs = trpc.notification.prefs.useQuery();
  const setPref = trpc.notification.setPref.useMutation();
  const savePrefs = trpc.user.updatePreferences.useMutation();

  const [steps, setSteps] = React.useState<"notifications" | "install" | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  const enabled = React.useCallback(
    (kind: NotificationKind): boolean =>
      prefs.data?.rows.find((row) => row.kind === kind)?.enabled ?? false,
    [prefs.data],
  );

  function toggle(kind: NotificationKind, next: boolean): void {
    void setPref
      .mutateAsync({ kind, enabled: next })
      .then(() => utils.notification.prefs.invalidate());
  }

  /** *Every item in… {block}* — the `(item_start, block_kind)` row (§9.3). */
  function toggleItemStart(blockKind: BlockKind, next: boolean): void {
    void setPref
      .mutateAsync({ kind: "item_start", enabled: next, blockKind })
      .then(() => utils.notification.prefs.invalidate());
  }

  async function turnOn(): Promise<void> {
    setError(null);
    const result = await subscribeToPush();
    refresh();
    if (result === "error" || result === "unsupported") {
      setError(COPY.subscribeFailed);
    }
  }

  if (prefs.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  const data = prefs.data;

  return (
    <div className="flex flex-col gap-(--space-5)">
      <PermissionLine
        state={state}
        onTurnOn={() => void turnOn()}
        onHow={(kind) => setSteps(kind)}
      />

      {error === null ? null : <HelperText error>{error}</HelperText>}
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      {/* UX v1.1 §9.1 (DYN-20): the block boundaries, the pins, the marker. */}
      <section className="flex flex-col gap-(--space-2)">
        <GroupHeading>{COPY.whenABlockStarts}</GroupHeading>
        <NotificationRow
          id="block_start"
          label={COPY.blockStart}
          checked={enabled("block_start")}
          disabled={!online}
          onCheckedChange={(next) => toggle("block_start", next)}
        />
        <NotificationRow
          id="fixture_start"
          label={COPY.fixtureStart}
          checked={enabled("fixture_start")}
          disabled={!online}
          onCheckedChange={(next) => toggle("fixture_start", next)}
        />
        <NotificationRow
          id="devices_off"
          label={COPY.devicesOff}
          checked={enabled("devices_off")}
          disabled={!online}
          onCheckedChange={(next) => toggle("devices_off", next)}
        />
      </section>

      {/* §9.3: N1b as a group of block-kind toggles under one heading (R19). */}
      <section className="flex flex-col gap-(--space-2)">
        <GroupHeading>{COPY.everyItemIn}</GroupHeading>
        {(data?.itemStartBlocks ?? []).map((row) => (
          <NotificationRow
            key={row.blockKind}
            id={`item_start_${row.blockKind}`}
            label={BLOCK_KIND_WORDS[row.blockKind]}
            checked={row.enabled}
            disabled={!online}
            onCheckedChange={(next) => toggleItemStart(row.blockKind, next)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-(--space-2)">
        <GroupHeading>{COPY.reviews}</GroupHeading>
        <NotificationRow
          id="review_reminder"
          label={COPY.reviewReminder}
          checked={enabled("review_reminder")}
          disabled={!online}
          onCheckedChange={(next) => toggle("review_reminder", next)}
          value={{
            kind: "time",
            value: data?.reviewReminderTime ?? "21:00",
            onChange: (value) => {
              void savePrefs
                .mutateAsync({ reviewReminderTime: value })
                .then(async () => {
                  await utils.notification.prefs.invalidate();
                  // ST-08 shows the same field.
                  await utils.user.me.invalidate();
                });
            },
          }}
        />
        <NotificationRow
          id="pending_review"
          label={COPY.pendingReview}
          checked={enabled("pending_review")}
          disabled={!online}
          onCheckedChange={(next) => toggle("pending_review", next)}
        />
      </section>

      {/* UX v1.2 §9 N2 (RUN-11): the journal reminder — the time is a profile fact, the switch is both the pref and the profile's own. */}
      {data?.journalEnabled ? (
        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.theJournal}</GroupHeading>
          <NotificationRow
            id="journal_reminder"
            label={COPY.journalReminder}
            checked={enabled("journal_reminder") && data.journalReminderEnabled}
            disabled={!online}
            onCheckedChange={(next) => {
              toggle("journal_reminder", next);
              void savePrefs
                .mutateAsync({ journalReminderEnabled: next })
                .then(() => utils.user.me.invalidate());
            }}
            value={{
              kind: "time",
              value: data.journalReminderTime ?? "20:45",
              onChange: (value) => {
                void savePrefs
                  .mutateAsync({ journalReminderTime: value })
                  .then(async () => {
                    await utils.notification.prefs.invalidate();
                    await utils.user.me.invalidate();
                  });
              },
            }}
          />
        </section>
      ) : null}

      <section className="flex flex-col gap-(--space-2)">
        <GroupHeading>{COPY.planning}</GroupHeading>
        <NotificationRow
          id="week_build"
          label={COPY.weekBuild}
          checked={enabled("week_build")}
          disabled={!online}
          onCheckedChange={(next) => toggle("week_build", next)}
          value={{
            kind: "day-time",
            day: toSundayFirst(data?.weekBuildReminderWeekday ?? 6),
            time: data?.weekBuildReminderTime ?? "18:00",
            onChange: (day, time) => {
              void savePrefs
                .mutateAsync({
                  weekBuildReminderWeekday: toMondayFirst(day),
                  weekBuildReminderTime: time,
                })
                .then(() => utils.notification.prefs.invalidate());
            },
          }}
        />
      </section>

      <Text as="p" variant="caption" tone="secondary">
        {COPY.closingLine}
      </Text>

      <PlatformStepsSheet
        open={steps !== null}
        kind={steps ?? "notifications"}
        onOpenChange={(next) => {
          if (!next) setSteps(null);
        }}
      />
    </div>
  );
}

/**
 * The one line at the top, and the only place the app talks about permission.
 *
 * `unsupported` HAS NO ACTION. There is nothing to turn on in a browser that
 * cannot receive push, and a button that would fail is worse than a sentence
 * that explains.
 */
function PermissionLine({
  state,
  onTurnOn,
  onHow,
}: {
  state: PermissionState;
  onTurnOn: () => void;
  onHow: (kind: "notifications" | "install") => void;
}) {
  switch (state) {
    case "granted":
      return (
        <StatusLine
          variant="permission"
          placement="inline"
          text={COPY.granted}
        />
      );
    case "denied":
      return (
        <StatusLine
          variant="permission"
          placement="inline"
          text={COPY.denied}
          action={{ label: COPY.how, onClick: () => onHow("notifications") }}
        />
      );
    case "not-installed":
      return (
        <StatusLine
          variant="permission"
          placement="inline"
          text={COPY.notInstalled}
          action={{ label: COPY.how, onClick: () => onHow("install") }}
        />
      );
    case "not-asked":
      return (
        <StatusLine
          variant="permission"
          placement="inline"
          text={COPY.notAsked}
          action={{ label: COPY.turnOn, onClick: onTurnOn }}
        />
      );
    default:
      return (
        <StatusLine
          variant="permission"
          placement="inline"
          text={COPY.unsupported}
        />
      );
  }
}

/**
 * THE TWO WEEKDAY NUMBERINGS ARE DIFFERENT, and this is where they meet.
 *
 * The product indexes weekdays Monday = 0 (`weekdayIndex`, and
 * `users.week_build_reminder_weekday`, whose default 6 is Sunday).
 * `NotificationRow` names its days from a Sunday-first array, the JavaScript
 * convention. Converting in one named pair, at the boundary, is what stops a
 * reminder set for Sunday from firing on Monday.
 */
function toSundayFirst(mondayFirst: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return (((mondayFirst + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
}

function toMondayFirst(sundayFirst: number): number {
  return (sundayFirst + 6) % 7;
}
