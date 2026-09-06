import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getRequestUser } from "@/lib/auth/get-request-user";
import { getServerApi } from "@/lib/trpc/server";

import { SETTINGS_COPY } from "../_components/copy";
import { AccountScreen } from "./_components/account-screen";

/**
 * ST-01 Account.
 *
 * WHETHER THIS ACCOUNT HAS A PASSWORD IS ANSWERED FROM THE IDENTITY LIST, on
 * the server, where the auth user actually is. An account with no `email`
 * identity has never had a password, so the Password section is one sentence
 * rather than a form — and asking the browser would mean shipping the identity
 * list to it for no other reason.
 */
export default async function SettingsAccountPage() {
  const api = await getServerApi();
  const me = await api.user.me();
  const { user } = await getRequestUser();

  const identities = user?.identities ?? [];
  const googleOnly =
    identities.length > 0 &&
    !identities.some((identity) => identity.provider === "email");

  return (
    <PageFrame
      header={<ShellPageHeader title={SETTINGS_COPY.account} showBack />}
    >
      <AccountScreen
        name={me.displayName ?? ""}
        email={me.email ?? ""}
        googleOnly={googleOnly}
      />
    </PageFrame>
  );
}
