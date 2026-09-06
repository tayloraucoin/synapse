import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { REMINDER_COPY } from "@/components/reminder-prompt";

import { ReasonsScreen } from "./_components/reasons-screen";

/** ST-06 Reasons. */
export default function SettingsReasonsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={REMINDER_COPY.reasonsTitle} showBack />}
    >
      <ReasonsScreen />
    </PageFrame>
  );
}
