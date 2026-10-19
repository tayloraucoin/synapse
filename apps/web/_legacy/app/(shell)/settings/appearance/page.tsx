import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { SETTINGS_COPY } from "../_components/copy";
import { AppearanceForm } from "./_components/appearance-form";

/** ST-09 Appearance. */
export default function SettingsAppearancePage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={SETTINGS_COPY.appearance} showBack />}
    >
      <AppearanceForm />
    </PageFrame>
  );
}
