"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { mapAuthError } from "@syn/auth/errors";
import { STORAGE_KEYS } from "@syn/constants";
import { AuthFrame, Button, Text } from "@syn/ui";

import { AUTH_COPY } from "@/app/(auth)/_components/copy";
import { FormMessage } from "@/app/(auth)/_components/form-message";
import { createClient } from "@/lib/clients/supabase/client";
import { useOnline } from "@/lib/hooks/use-online";
import { homeRoute, signInRoute, signUpRoute } from "@/lib/routes";

const COPY = AUTH_COPY.verify;
const RESEND_COOLDOWN_SECONDS = 30;
const SENT_LABEL_MS = 2000;
/** After this many sends, the screen stops promising and offers a way out. */
const SENDS_BEFORE_ADVICE = 3;

/**
 * AU-03 Check your email.
 *
 * THE SESSION IS POLLED ON FOCUS, NOT ON A TIMER. The case this covers is "the
 * link was opened on another device" (AU-03), which is rare; a five-second
 * interval would spend battery on every person who is simply reading their
 * inbox in another tab. Coming back to the tab is the signal that something
 * might have changed, so that is when it asks.
 */
export function VerifyPanel({ sessionEmail }: { sessionEmail: string | null }) {
  const router = useRouter();
  const online = useOnline();

  const [email, setEmail] = React.useState<string | null>(sessionEmail);
  const [sendCount, setSendCount] = React.useState(0);
  const [cooldown, setCooldown] = React.useState(0);
  const [justSent, setJustSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Someone who just signed up has no session; their address is the one AU-02
  // put in sessionStorage.
  React.useEffect(() => {
    if (sessionEmail) return;
    const pending = window.sessionStorage.getItem(
      STORAGE_KEYS.AUTH_PENDING_EMAIL,
    );
    if (pending) setEmail(pending);
  }, [sessionEmail]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldown]);

  // The link may have been opened elsewhere. Ask when the tab comes back.
  React.useEffect(() => {
    async function checkSession(): Promise<void> {
      if (document.hidden) return;
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.email_confirmed_at) {
        router.replace(homeRoute());
      }
    }

    function onWake(): void {
      void checkSession();
    }

    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [router]);

  async function resend(): Promise<void> {
    if (!email) return;
    setError(null);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      setError(mapAuthError(resendError));
      return;
    }

    setSendCount((current) => current + 1);
    setJustSent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    window.setTimeout(() => {
      setJustSent(false);
    }, SENT_LABEL_MS);
  }

  const resendLabel = justSent
    ? COPY.resent
    : cooldown > 0
      ? COPY.resendCooldown(cooldown)
      : COPY.resend;

  return (
    <AuthFrame heading={COPY.heading}>
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.bodyLead}{" "}
        <strong className="font-medium text-ink">
          {email ?? COPY.bodyFallbackAddress}
        </strong>
        . {COPY.bodyTail}
      </Text>

      <Button
        variant="secondary"
        disabled={!online || cooldown > 0 || !email}
        onClick={() => void resend()}
        className="w-full"
        // The countdown rewrites this label every second. Announcing each tick
        // would talk over everything else on the screen.
        aria-live="off"
      >
        {resendLabel}
      </Button>

      {sendCount >= SENDS_BEFORE_ADVICE ? (
        <FormMessage>{COPY.thirdSend}</FormMessage>
      ) : null}

      {!online ? <FormMessage>{COPY.offline}</FormMessage> : null}

      {error === null ? null : <FormMessage>{error}</FormMessage>}

      <div className="flex flex-col gap-(--space-2)">
        <Link
          href={signUpRoute()}
          className="self-start font-medium text-ink underline underline-offset-4"
        >
          {COPY.differentEmail}
        </Link>
        <Link
          href={signInRoute()}
          className="self-start font-medium text-ink underline underline-offset-4"
        >
          {COPY.signIn}
        </Link>
      </div>

      {/*
       * AU-03 calls this note "muted", which is a visual register, not a token
       * name: `tone="muted"` is neutral-400 and passes AA only at large sizes
       * (official spec §9.3, and the accessibility floor in §11 is not
       * negotiable). `secondary` is the quiet tone that passes at this size.
       */}
      <Text as="p" variant="caption" tone="secondary">
        {COPY.note}
      </Text>
    </AuthFrame>
  );
}
