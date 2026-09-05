import { sanitizeNextPath } from "@syn/utils";
import { AuthFrame } from "@syn/ui";

import { AUTH_COPY, AUTH_NOTICE } from "@/app/(auth)/_components/copy";

import { SignInForm } from "./_components/sign-in-form";

/**
 * AU-01 Sign in.
 *
 * `next` and the notice flags arrive from a URL, so both are untrusted.
 * `next` is sanitised HERE, once, before it reaches the client leaf — a raw
 * value that got as far as a `router.replace` would be an open redirect.
 * The notices are matched against a closed set for the same reason: a query
 * string never becomes a sentence on the screen.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const rawNext = typeof params.next === "string" ? params.next : null;
  // `sanitizeNextPath` returns the fallback for anything unsafe; comparing
  // against it tells us whether there was a real destination at all.
  const safeNext = rawNext ? sanitizeNextPath(rawNext, "/") : null;
  const next = safeNext === "/" ? null : safeNext;

  const notice = typeof params.notice === "string" ? params.notice : null;
  const authFlag = typeof params.auth === "string" ? params.auth : null;

  const message =
    notice === AUTH_NOTICE.passwordChanged
      ? AUTH_COPY.signIn.passwordChanged
      : authFlag === "link_expired"
        ? AUTH_COPY.signIn.linkExpired
        : authFlag === "error" || authFlag === "missing_code"
          ? AUTH_COPY.signIn.oauthFailed
          : null;

  return (
    <AuthFrame heading={AUTH_COPY.signIn.heading} trustLine>
      <SignInForm next={next} initialMessage={message} />
    </AuthFrame>
  );
}
