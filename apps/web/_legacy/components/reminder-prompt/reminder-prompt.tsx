"use client";

import * as React from "react";

import { Button, HelperText, ResponsiveSheet, Text } from "@syn/ui";

import { PlatformStepsSheet } from "@/components/platform-steps-sheet";
import { SheetHost } from "@/components/page-frame";
import { subscribeToPush } from "@/lib/pwa/push-subscribe";

import { REMINDER_COPY as COPY } from "./copy";
import { useReminderPrompt } from "./use-reminder-prompt";

/**
 * The one moment reminders are ever asked about — official spec §8.3.
 *
 * IT NAMES THE TIME THE PERSON JUST SET. "Want a reminder at 7:20 when this
 * comes up?" is a question about the thing they are doing; "enable
 * notifications?" is a question about the app. That difference is the entire
 * reason the ask is here and not at sign-up.
 *
 * BOTH ANSWERS ARE FINAL. *Not now* writes `reminder_prompt_answered_at`
 * exactly as the primary does, so this sheet is never shown again — and Esc
 * counts as *Not now*, because dismissing a question is answering it.
 *
 * THE PRIMARY IS FIRST IN FOCUS ORDER, which no other sheet in this product
 * does. §8.3 puts the affirmative first here because the person has just
 * scheduled something and the offer is a service, not a request.
 */
export function ReminderPrompt({
  controller,
}: {
  controller: ReturnType<typeof useReminderPrompt>;
}) {
  const [stepsOpen, setStepsOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const open = controller.offer !== null;

  async function turnOn(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const result = await subscribeToPush();
      // The answer is recorded either way: they answered, and a missing VAPID
      // key on this tier is not their mistake to be asked about again.
      await controller.recordAnswered();
      controller.refreshPermission();

      if (result === "subscribed" || result === "denied") {
        controller.dismiss();
        return;
      }
      setError(COPY.subscribeFailed);
    } finally {
      setBusy(false);
    }
  }

  async function notNow(): Promise<void> {
    await controller.recordAnswered();
    controller.dismiss();
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          // Dismissing is answering.
          if (!next) void notNow();
        }}
        title={COPY.sheetTitle}
        initialFocus="first-field"
        footer={
          <div className="flex flex-col gap-(--space-2)">
            {controller.needsInstall ? (
              <Button onClick={() => setStepsOpen(true)}>
                {COPY.howToInstall}
              </Button>
            ) : (
              <Button busy={busy} onClick={() => void turnOn()}>
                {COPY.turnOn}
              </Button>
            )}
            <Button variant="ghost" onClick={() => void notNow()}>
              {COPY.notNow}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p">
            {controller.needsInstall
              ? COPY.installBody
              : COPY.body(controller.offer?.startLabel ?? "")}
          </Text>
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      <PlatformStepsSheet
        open={stepsOpen}
        kind="install"
        onOpenChange={(next) => {
          setStepsOpen(next);
          // Reading the install steps is the answer on iOS.
          if (!next) void notNow();
        }}
      />
    </SheetHost>
  );
}
