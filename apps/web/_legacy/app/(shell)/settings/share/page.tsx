import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { env } from "@/env";
import { inviteRoute } from "@/lib/routes";

import { SETTINGS_COPY } from "../_components/copy";
import { SharePanel } from "./_components/share-panel";

/**
 * ST-11 Share the app.
 *
 * The link is the tier's own origin plus `/invite`, built on the server from
 * `env.siteUrl`. A client leaf reading `window.location.origin` would hand out
 * whatever host the person happens to be on — a preview deployment, a LAN
 * address during development — and those links work for nobody else.
 */
export default function SettingsSharePage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={SETTINGS_COPY.shareTheApp} showBack />}
    >
      <SharePanel url={`${env.siteUrl}${inviteRoute()}`} />
    </PageFrame>
  );
}
