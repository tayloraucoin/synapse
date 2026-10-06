"use client";

import { ThemeControl } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import { SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-09 — three rows and no save button.
 *
 * SELECTION APPLIES IMMEDIATELY, and writes both stores. `ThemeControl` flips
 * the class on `<html>` in the same frame, so the screen is its own preview;
 * this records the choice on the account so a second browser opens dark
 * without anyone touching the control again.
 *
 * THE WRITE IS FIRE-AND-FORGET, deliberately. The visible change has already
 * happened locally, and blocking a colour scheme behind a round trip — or
 * reverting it because one failed — would be the screen arguing with something
 * the person can plainly see. A failed write leaves the other device one theme
 * behind, which the next successful write fixes.
 */
export function AppearanceForm() {
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();

  return (
    <ThemeControl
      helperText={COPY.appearanceHelper}
      onThemeChange={(theme) => {
        void save
          .mutateAsync({ theme })
          .then(() => utils.user.me.invalidate())
          .catch(() => undefined);
      }}
    />
  );
}
