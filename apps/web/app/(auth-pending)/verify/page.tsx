import { getRequestUser } from "@/lib/auth/get-request-user";

import { VerifyPanel } from "./_components/verify-panel";

/**
 * AU-03 Check your email.
 *
 * The address can come from two places and the server only knows one of them:
 * a session's email. The other — someone who just signed up and therefore has
 * no session — is in `sessionStorage`, which only the client can read. So the
 * server passes what it has and the leaf falls back.
 */
export default async function VerifyPage() {
  const { user } = await getRequestUser();

  return <VerifyPanel sessionEmail={user?.email ?? null} />;
}
