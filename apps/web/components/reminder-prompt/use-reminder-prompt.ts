"use client";

import * as React from "react";

import { usePermissionState } from "@/lib/pwa/permission-state";
import { trpc } from "@/lib/trpc/client";

/**
 * Whether to ask about reminders, and the state of asking — official spec
 * §8.3.
 *
 * THE FOUR CONDITIONS ARE THE WHOLE RULE, and all four must hold:
 *
 *  1. **The saved item has a fixed time.** A reminder is a time; there is
 *     nothing to offer for something scheduled *anytime*.
 *  2. **First run is finished.** §8.3 says permission is "never requested at
 *     sign-up or first run". Someone three screens into setting up an app has
 *     not yet decided they want it, and an OS prompt at that moment is the
 *     most expensive question the product can ask — the OS never lets it be
 *     asked again.
 *  3. **The ask has never been answered.** `reminder_prompt_answered_at`
 *     records that the question was PUT, not what was said; *Not now* sets it
 *     exactly as *Turn on reminders* does. Asking twice is asking someone to
 *     say no twice.
 *  4. **This device could still be asked** — `not-asked`, or `not-installed`
 *     on iOS where the answer is an install rather than a permission. After an
 *     OS denial there is no prompt left to show: the browser has taken the
 *     question away, and ST-07's line is where it lives from then on.
 *
 * IT ASKS ON `onSaved`, not on open. The person has just committed to
 * something happening at a time — that is the moment the offer means
 * something, and it is the only moment the sheet can name a real time.
 */
export type ReminderPromptItem = {
  timeMode: "fixed_time" | "window" | "unscheduled";
  /** As the row would show it — "7:20". Named in the sheet's body. */
  startLabel: string | null;
};

export function useReminderPrompt() {
  const { state, refresh } = usePermissionState();
  const me = trpc.user.me.useQuery(undefined, { retry: false });
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();

  const [offer, setOffer] = React.useState<{ startLabel: string } | null>(
    null,
  );

  const eligible =
    me.data !== undefined &&
    me.data.firstRunCompletedAt !== null &&
    me.data.reminderPromptAnsweredAt === null &&
    (state === "not-asked" || state === "not-installed");

  /** Called from TP-03's and WK-03's `onSaved`. */
  const maybeOffer = React.useCallback(
    (item: ReminderPromptItem) => {
      if (!eligible) return;
      if (item.timeMode !== "fixed_time") return;
      if (item.startLabel === null) return;
      setOffer({ startLabel: item.startLabel });
    },
    [eligible],
  );

  /**
   * Record that the question was answered — whichever way.
   *
   * It is written for BOTH answers, and it is written even when the
   * subscription then fails: the person answered, and asking again because the
   * VAPID key was missing on that tier would punish them for a deployment
   * problem.
   */
  const recordAnswered = React.useCallback(async () => {
    try {
      await save.mutateAsync({ reminderPromptAnsweredAt: new Date() });
      await utils.user.me.invalidate();
    } catch {
      // A failed write means the offer may appear once more. That is the safe
      // direction: the alternative is never asking someone who never answered.
    }
  }, [save, utils]);

  return {
    /** Non-null while the sheet should be open. */
    offer,
    /** iOS in a browser: the answer is an install, not a permission. */
    needsInstall: state === "not-installed",
    maybeOffer,
    dismiss: React.useCallback(() => setOffer(null), []),
    recordAnswered,
    refreshPermission: refresh,
  };
}
