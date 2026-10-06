import { AuthFrame } from "@syn/ui";

import { AUTH_COPY, AUTH_NOTICE } from "@/app/(auth)/_components/copy";

import { SignUpForm } from "./_components/sign-up-form";

/**
 * AU-02 Create account.
 *
 * The invite line is a query flag, not a second screen: `/invite` redirects
 * here with `notice=invite`, so the shared link and the *Create an account*
 * link land on one form that cannot drift into two.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const fromInvite = params.notice === AUTH_NOTICE.invite;

  return (
    <AuthFrame
      heading={AUTH_COPY.signUp.heading}
      lead={fromInvite ? AUTH_COPY.signUp.inviteLine : undefined}
      trustLine
    >
      <SignUpForm />
    </AuthFrame>
  );
}
