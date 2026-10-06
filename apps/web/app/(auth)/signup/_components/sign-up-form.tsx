"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { describeAuthError } from "@/lib/auth/describe-auth-error";
import { STORAGE_KEYS } from "@syn/constants";
import { Button, Input, OAuthButton, Text } from "@syn/ui";
import { signUpInput, type SignUpInput } from "@syn/validators";

import { AuthDivider } from "@/app/(auth)/_components/auth-divider";
import { AUTH_COPY } from "@/app/(auth)/_components/copy";
import { FormMessage } from "@/app/(auth)/_components/form-message";
import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm, visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import {
  authCallbackRoute,
  authConfirmRoute,
  signInRoute,
  verifyRoute,
} from "@/lib/routes";

const COPY = AUTH_COPY.signUp;

/**
 * AU-02 Create account.
 *
 * THE EXISTING-ACCOUNT CASE HAS NO ERROR. With email confirmation on, Supabase
 * answers a sign-up for an address that already exists with a SUCCESS carrying
 * a user whose `identities` array is empty — deliberately, so the response
 * cannot be used to enumerate accounts. Reading that array is the only way to
 * tell the two apart, so the error path is never taken here. Do not "fix" this
 * by checking `error`.
 */
export function SignUpForm() {
  const router = useRouter();
  const online = useOnline();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [existingAccount, setExistingAccount] = React.useState(false);
  const [oauthBusy, setOauthBusy] = React.useState(false);

  const form = useSynapseForm<SignUpInput>({
    schema: signUpInput,
    defaultValues: { displayName: "", email: "", password: "" },
  });

  const submitting = form.formState.isSubmitting;
  const disabled = !online || submitting || oauthBusy;

  // AU-03's *Use a different email* returns here with the name still typed.
  React.useEffect(() => {
    const pendingName = window.sessionStorage.getItem(
      STORAGE_KEYS.AUTH_PENDING_NAME,
    );
    if (pendingName) {
      form.setValue("displayName", pendingName);
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setExistingAccount(false);

    const supabase = createClient();
    const emailRedirectTo = new URL(
      authConfirmRoute(),
      window.location.origin,
    );
    emailRedirectTo.searchParams.set("next", "/");

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: emailRedirectTo.toString(),
      },
    });

    if (error) {
      setFormError(describeAuthError(error));
      return;
    }

    // See the note above: an empty `identities` array is the "already exists"
    // signal, and it arrives on the success path.
    if (data.user && data.user.identities?.length === 0) {
      setExistingAccount(true);
      return;
    }

    // The address travels in sessionStorage, never the URL — a query string
    // ends up in history and in any referrer.
    window.sessionStorage.setItem(
      STORAGE_KEYS.AUTH_PENDING_EMAIL,
      values.email,
    );
    window.sessionStorage.setItem(
      STORAGE_KEYS.AUTH_PENDING_NAME,
      values.displayName,
    );
    router.replace(verifyRoute());
  });

  async function signUpWithGoogle(): Promise<void> {
    setFormError(null);
    setExistingAccount(false);
    setOauthBusy(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: new URL(
          authCallbackRoute(),
          window.location.origin,
        ).toString(),
      },
    });

    if (error) {
      setOauthBusy(false);
      setFormError(describeAuthError(error));
    }
  }

  return (
    <div className="flex flex-col gap-(--space-4)">
      <OAuthButton
        provider="google"
        label={COPY.google}
        busy={oauthBusy}
        disabled={disabled}
        onClick={() => void signUpWithGoogle()}
      />

      <AuthDivider label={COPY.divider} />

      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <fieldset
          disabled={disabled}
          className="flex flex-col gap-(--space-4) border-0 p-0"
        >
          <Input
            {...form.register("displayName")}
            label={COPY.name}
            autoComplete="name"
            maxLength={40}
            error={visibleFieldError(form.formState, "displayName")}
          />

          <Input
            {...form.register("email")}
            mode="email"
            label={COPY.email}
            error={visibleFieldError(form.formState, "email")}
          />

          <Input
            {...form.register("password")}
            mode="password"
            label={COPY.password}
            autoComplete="new-password"
            helperText={COPY.passwordHelper}
            error={visibleFieldError(form.formState, "password")}
          />

          <Button type="submit" busy={submitting} className="w-full">
            {COPY.submit}
          </Button>
        </fieldset>
      </form>

      {!online ? <FormMessage>{COPY.offline}</FormMessage> : null}

      {existingAccount ? (
        <FormMessage
          action={{ label: COPY.existingAccountAction, href: signInRoute() }}
        >
          {COPY.existingAccount}
        </FormMessage>
      ) : null}

      {formError === null ? null : <FormMessage>{formError}</FormMessage>}

      <Text as="p" variant="secondary" tone="secondary">
        {COPY.footerLead}{" "}
        <Link
          href={signInRoute()}
          className="font-medium text-ink underline underline-offset-4"
        >
          {COPY.footerLink}
        </Link>
      </Text>
    </div>
  );
}
