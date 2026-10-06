import { AUTH_COPY, AUTH_NOTICE } from "@/app/(auth)/_components/copy";

import { ForgotForm } from "./_components/forgot-form";

/**
 * AU-04 Forgot password.
 *
 * The frame lives in the leaf here, because the heading changes when the link
 * is sent. This page's whole job is to read the two query values and hand them
 * over as values, never as markup.
 */
export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Prefilled from AU-01's *Forgot your password?* link.
  const email = typeof params.email === "string" ? params.email : "";
  // AU-05 sends an expired recovery link here.
  const expired = params.notice === AUTH_NOTICE.expired;

  return (
    <ForgotForm
      initialEmail={email}
      initialMessage={expired ? AUTH_COPY.forgot.expired : null}
    />
  );
}
