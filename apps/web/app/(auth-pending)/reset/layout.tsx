import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { forgotRoute, withNotice } from "@/lib/routes";

import { AUTH_NOTICE } from "@/app/(auth)/_components/copy";

/**
 * AU-05's gate — the inverse of `(auth)`'s.
 *
 * A recovery link is verified at `/auth/confirm`, which SIGNS THE PERSON IN and
 * redirects here; that session is the authority `updateUser({ password })`
 * needs. So a session is the precondition, not the disqualifier.
 *
 * No session means the link was expired, already used, or never followed —
 * every one of which is the same thing to the person: ask for another. Epic 1
 * AU-05 sends them to AU-04 carrying that sentence.
 */
export default async function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getRequestUser();

  if (!user) {
    redirect(withNotice(forgotRoute(), AUTH_NOTICE.expired));
  }

  return <>{children}</>;
}
