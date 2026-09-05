"use client";

import Link from "next/link";
import * as React from "react";

import { AuthFrame, Button, Input, Text } from "@syn/ui";
import { forgotPasswordInput, type ForgotPasswordInput } from "@syn/validators";

import { AUTH_COPY } from "@/app/(auth)/_components/copy";
import { FormMessage } from "@/app/(auth)/_components/form-message";
import { createClient } from "@/lib/clients/supabase/client";
import { useSynapseForm, visibleFieldError } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import { authConfirmRoute, resetRoute, signInRoute } from "@/lib/routes";

const COPY = AUTH_COPY.forgot;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * AU-04 Forgot password.
 *
 * THE LEAF OWNS THE FRAME because the heading changes with the state: idle is
 * *Reset your password* and sent is *Check your email*. A server page holding
 * the heading would need the client's state to pick it, which is the shape
 * that ends in two screens for one flow.
 *
 * THIS SCREEN NEVER REVEALS WHETHER AN ACCOUNT EXISTS. The sent state renders
 * on every outcome that reached the server, success or failure — Supabase
 * answers the same way for both by design, and surfacing anything else here
 * would rebuild the enumeration oracle it avoids. A NETWORK failure is the one
 * exception, because "we couldn't reach the server" says nothing about the
 * address; that shows the offline line instead.
 */
export function ForgotForm({
  initialEmail,
  initialMessage,
}: {
  initialEmail: string;
  initialMessage: string | null;
}) {
  const online = useOnline();

  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [networkError, setNetworkError] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const form = useSynapseForm<ForgotPasswordInput>({
    schema: forgotPasswordInput,
    defaultValues: { email: initialEmail },
  });

  const submitting = form.formState.isSubmitting;

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldown]);

  async function send(email: string): Promise<void> {
    setNetworkError(false);

    const redirectTo = new URL(authConfirmRoute(), window.location.origin);
    redirectTo.searchParams.set("next", resetRoute());

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
      });
    } catch {
      // Only a transport failure lands here; a rejected address does not.
      setNetworkError(true);
      return;
    }

    setSentTo(email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await send(values.email);
  });

  if (sentTo !== null) {
    return (
      <AuthFrame heading={COPY.sentHeading}>
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.sentBodyLead}{" "}
          <strong className="font-medium text-ink">{sentTo}</strong>,{" "}
          {COPY.sentBodyTail}
        </Text>

        <Button
          variant="secondary"
          disabled={cooldown > 0 || !online}
          onClick={() => void send(sentTo)}
          className="w-full"
        >
          {cooldown > 0 ? COPY.resendCooldown(cooldown) : COPY.resend}
        </Button>

        {networkError ? <FormMessage>{COPY.offline}</FormMessage> : null}

        <Link
          href={signInRoute()}
          className="self-start font-medium text-ink underline underline-offset-4"
        >
          {COPY.backToSignIn}
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame heading={COPY.heading} lead={COPY.body}>
      <form noValidate onSubmit={(event) => void onSubmit(event)}>
        <fieldset
          disabled={!online || submitting}
          className="flex flex-col gap-(--space-4) border-0 p-0"
        >
          <Input
            {...form.register("email")}
            mode="email"
            label={COPY.email}
            error={visibleFieldError(form.formState, "email")}
          />

          <Button type="submit" busy={submitting} className="w-full">
            {COPY.submit}
          </Button>
        </fieldset>
      </form>

      {!online || networkError ? <FormMessage>{COPY.offline}</FormMessage> : null}

      {initialMessage === null ? null : (
        <FormMessage>{initialMessage}</FormMessage>
      )}

      <Link
        href={signInRoute()}
        className="self-start font-medium text-ink underline underline-offset-4"
      >
        {COPY.backToSignIn}
      </Link>
    </AuthFrame>
  );
}
