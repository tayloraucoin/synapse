"use client";

import * as React from "react";

import { Button } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";

import { SETTINGS_COPY as COPY } from "../../_components/copy";
import { SignOutDialog } from "../../_components/settings-index";
import { AccountForm } from "./account-form";
import { AccountPhoto } from "./account-photo";
import { PasswordSection } from "./password-section";

/**
 * ST-01, assembled.
 *
 * The photo, the form and the password section are separate components because
 * they fail separately: an upload that fails must not discard a typed name,
 * and a wrong current password must not clear the email field. One form over
 * all three would make every failure everyone's failure.
 *
 * *Sign out* reuses the index's dialog rather than declaring AU-06's strings a
 * second time — two copies of "Your data stays in your account." is one copy
 * too many.
 */
export function AccountScreen({
  name,
  email,
  googleOnly,
}: {
  name: string;
  email: string;
  googleOnly: boolean;
}) {
  const online = useOnline();
  const [signOutOpen, setSignOutOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-(--space-6)">
      <AccountPhoto name={name} />

      <AccountForm initialName={name} initialEmail={email} />

      <PasswordSection googleOnly={googleOnly} email={email} />

      <div>
        <Button variant="ghost" onClick={() => setSignOutOpen(true)}>
          {COPY.signOut}
        </Button>
      </div>

      <SignOutDialog
        open={signOutOpen}
        online={online}
        onOpenChange={setSignOutOpen}
      />
    </div>
  );
}
