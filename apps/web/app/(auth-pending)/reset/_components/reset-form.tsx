"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { describeAuthError } from "@/lib/auth/describe-auth-error";
import { Button, Input } from "@syn/ui";
import { resetPasswordInput, type ResetPasswordInput } from "@syn/validators";

import { AUTH_COPY, AUTH_NOTICE } from "@/app/(auth)/_components/copy";
import { FormMessage } from "@/app/(auth)/_components/form-message";
import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm, visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import { signInRoute, withNotice } from "@/lib/routes";

const COPY = AUTH_COPY.reset;

/**
 * AU-05 Reset password.
 *
 * SAVING SIGNS THE PERSON OUT. The recovery session was minted by an emailed
 * link, and a link that has been in an inbox is a weaker credential than the
 * password just chosen with it. Ending it means the new password is used at
 * least once, on purpose, and that any other device holding the old session is
 * not quietly carried forward by a reset the person may have requested BECAUSE
 * something was wrong.
 */
export function ResetForm() {
  const router = useRouter();
  const online = useOnline();

  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useSynapseForm<ResetPasswordInput>({
    schema: resetPasswordInput,
    defaultValues: { password: "", confirmPassword: "" },
  });

  const submitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setFormError(describeAuthError(error));
      return;
    }

    await supabase.auth.signOut();
    router.replace(withNotice(signInRoute(), AUTH_NOTICE.passwordChanged));
  });

  return (
    <div className="flex flex-col gap-(--space-4)">
      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <fieldset
          disabled={!online || submitting}
          className="flex flex-col gap-(--space-4) border-0 p-0"
        >
          <Input
            {...form.register("password")}
            mode="password"
            label={COPY.password}
            autoComplete="new-password"
            helperText={COPY.passwordHelper}
            error={visibleFieldError(form.formState, "password")}
          />

          <Input
            {...form.register("confirmPassword")}
            mode="password"
            label={COPY.confirmPassword}
            autoComplete="new-password"
            error={visibleFieldError(form.formState, "confirmPassword")}
          />

          <Button type="submit" busy={submitting} className="w-full">
            {COPY.submit}
          </Button>
        </fieldset>
      </form>

      {!online ? <FormMessage>{COPY.offline}</FormMessage> : null}

      {formError === null ? null : <FormMessage>{formError}</FormMessage>}
    </div>
  );
}
