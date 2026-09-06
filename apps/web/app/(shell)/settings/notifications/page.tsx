import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { REMINDER_COPY } from "@/components/reminder-prompt";

import { NotificationsScreen } from "./_components/notifications-screen";

/** ST-07 Notifications. */
export default function SettingsNotificationsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={REMINDER_COPY.title} showBack />}
    >
      <NotificationsScreen />
    </PageFrame>
  );
}
