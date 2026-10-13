"use client";

import * as React from "react";

import { Button, HelperText, Input, StatusLine, Text } from "@syn/ui";
import { DISPLAY_NAME_MAX } from "@syn/constants";
import { accountFormSchema, type AccountFormInput } from "@syn/validators";

import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import { authConfirmRoute, settingsAccountRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-01's name and email.
 *
 * THE NAME IS A ROW WRITE; THE EMAIL IS NOT. Changing an email changes an
 * identity, so it goes through Supabase's double confirmation and the shadow
 * row follows by trigger. Writing `users.email` here would leave the app
 * believing an address the auth server has never confirmed, and sign-in would
 * still want the old one.
 *
 * THE LINE NAMES THE NEW ADDRESS AND SAYS THE OLD ONE STILL WORKS, which is
 * both true and the thing a person actually worries about at that moment.
 */
export function AccountForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const save = trpc.user.updatePreferences.useMutation();

  const [error, setError] = React.useState<string | null>(null);
  const [emailPending, setEmailPending] = React.useState<string | null>(null);

  const form = useSynapseForm<AccountFormInput>({
    schema: accountFormSchema,
    defaultValues: { displayName: initialName, email: initialEmail },
  });

  const values = form.watch();

  async function onSubmit(input: AccountFormInput): Promise<void> {
    setError(null);
    setEmailPending(null);

    try {
      if (input.displayName !== initialName) {
        await save.mutateAsync({ displayName: input.displayName });
        await utils.user.me.invalidate();
        await utils.shell.status.invalidate();
      }

      if (input.email !== initialEmail) {
        const redirect = new URL(authConfirmRoute(), window.location.origin);
        redirect.searchParams.set("next", settingsAccountRoute());

        const { error: authError } = await createClient().auth.updateUser(
          { email: input.email },
          { emailRedirectTo: redirect.toString() },
        );

        if (authError) {
          // Supabase does not phrase this the way the document does.
          setError(
            /already|registered|exists/i.test(authError.message)
              ? COPY.emailInUse
              : COPY.saveFailed,
          );
          return;
        }
        setEmailPending(input.email);
      }

      form.reset(input);
    } catch {
      setError(COPY.saveFailed);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-(--space-4)"
    >
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <Input
        label={COPY.name}
        value={values.displayName}
        maxLength={DISPLAY_NAME_MAX}
        error={form.formState.errors.displayName?.message}
        onChange={(event) =>
          form.setValue("displayName", event.target.value, {
            shouldDirty: true,
          })
        }
      />

      <Input
        label={COPY.email}
        mode="email"
        value={values.email}
        error={form.formState.errors.email?.message}
        onChange={(event) =>
          form.setValue("email", event.target.value, { shouldDirty: true })
        }
      />

      {emailPending === null ? null : (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.emailPending(emailPending)}
        </Text>
      )}

      {error === null ? null : <HelperText error>{error}</HelperText>}

      <Button
        type="submit"
        className="self-start"
        busy={save.isPending}
        disabled={!online || !form.formState.isDirty}
      >
        {COPY.saveChanges}
      </Button>
    </form>
  );
}
