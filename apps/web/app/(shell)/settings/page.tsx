import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { env } from "@/env";
import { todayRoute } from "@/lib/routes";

import { SETTINGS_COPY } from "./_components/copy";
import { SettingsIndex } from "./_components/settings-index";

/**
 * ST-00 Settings.
 *
 * The version comes from `env.ts`, the app's one environment reader, stamped
 * into the bundle by `next.config.ts` from `package.json` and the build date.
 * Reading it here rather than in the client leaf keeps that rule true on the
 * page that displays it — AC12 greps this directory to prove it.
 */
export default function SettingsPage() {
  return (
    <PageFrame
      header={
        <ShellPageHeader
          title={SETTINGS_COPY.title}
          showBack
          backFallback={todayRoute()}
        />
      }
    >
      <SettingsIndex
        version={env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}
        buildDate={env.NEXT_PUBLIC_BUILD_DATE ?? ""}
      />
    </PageFrame>
  );
}
