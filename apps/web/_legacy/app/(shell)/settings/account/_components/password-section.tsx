"use client";

import * as React from "react";

import { Button, HelperText, Input, Text } from "@syn/ui";
import { PASSWORD_MIN } from "@syn/constants";
import {
  passwordChangeSchema,
  type PasswordChangeInput,
} from "@syn/validators";

import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";

import { SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-01's password section.
 *
 * IT RE-AUTHENTICATES FIRST. `updateUser({ password })` alone would let anyone
 * holding an unattended session change the password and lock the owner out —
 * that is how an account is taken, not how one is maintained. So the current
 * password is checked with a real sign-in call, and *That's not your current
 * password.* is that call's failure rather than a guess made on the client.
 *
 * A GOOGLE-ONLY ACCOUNT SEES ONE SENTENCE AND NO FIELDS. Offering a password
 * form to someone who has never had one would be offering a fix for a problem
 * they do not have.
 *
 * The section is a conditional render rather than a `CollapsiblePanel`: the
 * fields must not exist in the DOM until asked for, so a password manager does
 * not offer to fill three hidden boxes on a settings page.
 */
export function PasswordSection({
  googleOnly,
  email,
}: {
  googleOnly: boolean;
  email: string;
}) {
  const online = useOnline();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const firstFieldRef = React.useRef<HTMLInputElement>(null);

  const form = useSynapseForm<PasswordChangeInput>({
    schema: passwordChangeSchema,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (open) firstFieldRef.current?.focus();
  }, [open]);

  if (googleOnly) {
    return (
      <section className="flex flex-col gap-(--space-2)">
        <Text as="h2" variant="row-title">
          {COPY.password}
        </Text>
        <Text as="p" tone="secondary">
          {COPY.googleOnly}
        </Text>
      </section>
    );
  }

  async function onSubmit(input: PasswordChangeInput): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();

      // The re-authentication. Its failure is the wrong-password message.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: input.currentPassword,
      });
      if (signInError) {
        setError(COPY.wrongCurrentPassword);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: input.newPassword,
      });
      if (updateError) {
        setError(COPY.saveFailed);
        return;
      }

      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const values = form.watch();

  return (
    <section className="flex flex-col gap-(--space-3)">
      <Text as="h2" variant="row-title">
        {COPY.password}
      </Text>

      {open ? (
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          className="flex flex-col gap-(--space-3)"
        >
          <Input
            ref={firstFieldRef}
            label={COPY.currentPassword}
            mode="password"
            autoComplete="current-password"
            value={values.currentPassword}
            error={form.formState.errors.currentPassword?.message}
            onChange={(event) =>
              form.setValue("currentPassword", event.target.value)
            }
          />
          <Input
            label={COPY.newPassword}
            mode="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN}
            helperText={COPY.newPasswordHelper}
            value={values.newPassword}
            error={form.formState.errors.newPassword?.message}
            onChange={(event) =>
              form.setValue("newPassword", event.target.value)
            }
          />
          <Input
            label={COPY.confirmPassword}
            mode="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            error={form.formState.errors.confirmPassword?.message}
            onChange={(event) =>
              form.setValue("confirmPassword", event.target.value)
            }
          />

          {error === null ? null : <HelperText error>{error}</HelperText>}

          <Button
            type="submit"
            variant="secondary"
            className="self-start"
            busy={busy}
            disabled={!online}
          >
            {COPY.updatePassword}
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => setOpen(true)}
        >
          {COPY.changePassword}
        </Button>
      )}
    </section>
  );
}
