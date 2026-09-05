"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { mapAuthError } from "@syn/auth/errors";
import { STORAGE_KEYS } from "@syn/constants";
import { Button, Input, OAuthButton, Text } from "@syn/ui";
import { signInInput, type SignInInput } from "@syn/validators";

import { AuthDivider } from "@/app/(auth)/_components/auth-divider";
import { AUTH_COPY } from "@/app/(auth)/_components/copy";
import { FormMessage } from "@/app/(auth)/_components/form-message";
import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm, visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import { authCallbackRoute, forgotRoute, signUpRoute, verifyRoute } from "@/lib/routes";

const COPY = AUTH_COPY.signIn;

/**
 * AU-01 Sign in.
 *
 * WHY SUPABASE IS CALLED FROM THE BROWSER and not through tRPC: the SSR client
 * writes the session cookies, and a tRPC hop would put that write on the wrong
 * side of the request. This is the flow `docs/developer-guides/authentication.md`
 * describes.
 *
 * THE WRONG-CREDENTIALS SENTENCE NEVER SAYS WHICH WAS WRONG. `mapAuthError`
 * owns every sentence; a wrong email and a wrong password produce the same
 * one, because anything else is an account-enumeration oracle.
 */
export function SignInForm({
  next,
  initialMessage,
}: {
  /** Already sanitised by the page. */
  next: string | null;
  initialMessage: string | null;
}) {
  const router = useRouter();
  const online = useOnline();

  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(initialMessage);
  const [oauthBusy, setOauthBusy] = React.useState(false);

  const form = useSynapseForm<SignInInput>({
    schema: signInInput,
    defaultValues: { email: "", password: "" },
  });

  const submitting = form.formState.isSubmitting;
  const disabled = !online || submitting || oauthBusy;

  /** AU-01's unverified branch — the one error that carries a next step. */
  const isUnverified = formError === COPY.unverified;

  function goToVerify(): void {
    const email = form.getValues("email").trim();
    if (email) {
      window.sessionStorage.setItem(STORAGE_KEYS.AUTH_PENDING_EMAIL, email);
    }
    router.push(verifyRoute(next ?? undefined));
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(mapAuthError(error));
      return;
    }

    // `next` is already sanitised. With none, go to `/` and let the entry tree
    // decide — a page that guesses `/today` is a second entry tree.
    router.replace(next ?? "/");
  });

  async function signInWithGoogle(): Promise<void> {
    setFormError(null);
    setNotice(null);
    setOauthBusy(true);

    const supabase = createClient();
    const callback = new URL(authCallbackRoute(), window.location.origin);
    if (next) {
      callback.searchParams.set("next", next);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    // On success the browser is already navigating away; only a failure
    // returns here with the button still on screen.
    if (error) {
      setOauthBusy(false);
      setFormError(mapAuthError(error));
    }
  }

  return (
    <div className="flex flex-col gap-(--space-4)">
      {/*
       * An ARRIVAL notice sits above the form, because it is about how the
       * person got here — a failed Google return, a password just changed, an
       * expired link — and the Google button it usually refers to is the first
       * thing on the screen. A SUBMIT error sits under the form, next to the
       * button that produced it. Two positions, two different messages.
       */}
      {notice === null ? null : <FormMessage>{notice}</FormMessage>}

      <OAuthButton
        provider="google"
        label={COPY.google}
        busy={oauthBusy}
        disabled={disabled}
        onClick={() => void signInWithGoogle()}
      />

      <AuthDivider label={COPY.divider} />

      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <fieldset
          disabled={disabled}
          className="flex flex-col gap-(--space-4) border-0 p-0"
        >
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
            autoComplete="current-password"
            error={visibleFieldError(form.formState, "password")}
          />

          <Link
            href={forgotRoute()}
            className="self-start text-(length:--fs-secondary) text-text-secondary underline underline-offset-4 hover:text-ink"
          >
            {COPY.forgot}
          </Link>

          <Button type="submit" busy={submitting} className="w-full">
            {COPY.submit}
          </Button>
        </fieldset>
      </form>

      {!online ? <FormMessage>{COPY.offline}</FormMessage> : null}

      {formError === null ? null : (
        <FormMessage
          action={
            isUnverified
              ? { label: COPY.unverifiedAction, onClick: goToVerify }
              : undefined
          }
        >
          {formError}
        </FormMessage>
      )}

      <Text as="p" variant="secondary" tone="secondary">
        {COPY.footerLead}{" "}
        <Link
          href={signUpRoute()}
          className="font-medium text-ink underline underline-offset-4"
        >
          {COPY.footerLink}
        </Link>
      </Text>
    </div>
  );
}
