"use client";

import * as React from "react";

import {
  Avatar,
  Button,
  ConfirmDialog,
  ListRow,
  SettingsRow,
  SkeletonBlock,
  Text,
} from "@syn/ui";

import {
  logoutRoute,
  setupRoute,
  settingsAboutRoute,
  settingsAccountRoute,
  settingsAppearanceRoute,
  settingsCategoriesRoute,
  settingsDataRoute,
  settingsDayRoute,
  settingsHabitsRoute,
  settingsNotificationsRoute,
  settingsReasonsRoute,
  settingsShareRoute,
  settingsTemplatesRoute,
  settingsWeekRoute,
} from "@/lib/routes";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETTINGS_COPY as COPY } from "./copy";

/**
 * ST-00 — the index.
 *
 * IT NEVER RE-DERIVES THE ENTRY TREE. The resume row reads `first_run_step`
 * straight off the account and links to it. `resolveEntry` decides where a
 * cold open lands and this decides what one row says; a second copy of the
 * §4.2 rules here would be a second thing to keep in step with the first.
 *
 * COUNTS NEVER SPIN IN A ROW (cross-cutting G5). While they load, each shows a
 * `SkeletonBlock` in place of its number — a spinner inside a settings row
 * reads as something being wrong with that setting.
 *
 * *CALENDAR* IS ABSENT, not disabled. It is Phase 2, and a greyed row for a
 * feature that does not exist is a promise the product has not made.
 */
export function SettingsIndex({
  version,
  buildDate,
}: {
  version: string;
  buildDate: string;
}) {
  const online = useOnline();
  const [signOutOpen, setSignOutOpen] = React.useState(false);

  const me = trpc.user.me.useQuery();
  const avatar = trpc.user.avatar.useQuery();
  const counts = trpc.shell.settingsCounts.useQuery();

  const name = me.data?.displayName ?? "";
  const setupOwed = me.data ? me.data.firstRunCompletedAt === null : false;

  /** A number, or its placeholder — never a spinner. */
  const countText = (render: (value: number) => string, value?: number) =>
    value === undefined ? (
      <SkeletonBlock heightPx={16} className="max-w-24" />
    ) : (
      render(value)
    );

  return (
    <div className="flex flex-col gap-(--space-5)">
      <ul className="flex flex-col">
        <ListRow
          as="li"
          layout="wide"
          leading={
            <Avatar
              size={64}
              name={name}
              src={
                avatar.data ? `/api/assets/${avatar.data}` : null
              }
            />
          }
          title={name}
          meta={me.data?.email ?? ""}
          href={settingsAccountRoute()}
        />
      </ul>

      <ul className="flex flex-col">
        {setupOwed ? (
          <SettingsRow
            title={COPY.resumeSetup}
            href={setupRoute(me.data?.firstRunStep ?? 1)}
          />
        ) : null}

        <SettingsRow
          title={COPY.habits}
          description={countText(COPY.habitsCount, counts.data?.habits)}
          href={settingsHabitsRoute()}
        />
        <SettingsRow
          title={COPY.templates}
          description={countText(COPY.templatesCount, counts.data?.templates)}
          href={settingsTemplatesRoute()}
        />
        <SettingsRow
          title={COPY.week}
          description={countText(COPY.weekCount, counts.data?.plannedDays)}
          href={settingsWeekRoute()}
        />
        <SettingsRow
          title={COPY.categories}
          description={countText(
            COPY.categoriesCount,
            counts.data?.categories,
          )}
          href={settingsCategoriesRoute()}
        />
        <SettingsRow
          title={COPY.reasons}
          description={COPY.reasonsDescription}
          href={settingsReasonsRoute()}
        />
        <SettingsRow
          title={COPY.notifications}
          description={COPY.notificationsDescription}
          href={settingsNotificationsRoute()}
        />
        <SettingsRow
          title={COPY.dayAndTime}
          description={COPY.dayAndTimeDescription}
          href={settingsDayRoute()}
        />
        <SettingsRow
          title={COPY.appearance}
          description={COPY.appearanceDescription}
          href={settingsAppearanceRoute()}
        />
        <SettingsRow
          title={COPY.yourData}
          description={COPY.yourDataDescription}
          href={settingsDataRoute()}
        />
        <SettingsRow title={COPY.shareTheApp} href={settingsShareRoute()} />
        <SettingsRow
          title={COPY.about}
          description={COPY.aboutDescription}
          href={settingsAboutRoute()}
        />
      </ul>

      <div className="flex flex-col items-start gap-(--space-3)">
        <Button variant="ghost" onClick={() => setSignOutOpen(true)}>
          {COPY.signOut}
        </Button>
        <Text as="p" variant="caption" tone="secondary">
          {COPY.versionLine(version, buildDate)}
        </Text>
      </div>

      <SignOutDialog
        open={signOutOpen}
        online={online}
        onOpenChange={setSignOutOpen}
      />
    </div>
  );
}

/**
 * AU-06. The sign-out is a form POST to `/logout` rather than a client call,
 * so the session cookie is cleared by the server that set it and the browser
 * lands on `/signin` with no session left in memory.
 */
export function SignOutDialog({
  open,
  online,
  onOpenChange,
}: {
  open: boolean;
  online: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.signOutTitle}
        // Phase 1 has no timers to flush; USE-3 makes the offline sentence
        // literally true and adds the flush behind it.
        description={online ? COPY.signOutBody : COPY.signOutOfflineBody}
        confirmLabel={COPY.signOut}
        cancelLabel={COPY.staySignedIn}
        onConfirm={() => formRef.current?.requestSubmit()}
        onCancel={() => onOpenChange(false)}
      />
      <form ref={formRef} action={logoutRoute()} method="post" hidden />
    </>
  );
}
