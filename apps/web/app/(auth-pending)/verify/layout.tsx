import { redirect } from "next/navigation";

import { isEmailVerified } from "@syn/auth";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { homeRoute } from "@/lib/routes";

/**
 * AU-03's gate. Three states, one rule each:
 *
 * - No session — the ordinary case. Someone has just created an account and is
 *   waiting for the email; Supabase issues no session until it is confirmed.
 *   Render.
 * - Session, email unverified — what the shell gate sends here. Render.
 * - Session, email verified — nothing to wait for. Send them to the entry
 *   tree, which is the only thing that decides where "done" goes.
 *
 * The gate is here rather than in the page because a page that reads the
 * session is a second gate, and two gates on one route eventually disagree.
 */
export default async function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getRequestUser();

  if (user && isEmailVerified(user)) {
    redirect(homeRoute());
  }

  return <>{children}</>;
}
