import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { SETTINGS_COPY } from "../_components/copy";
import { DayTimeForm } from "./_components/day-time-form";

/** ST-08 Day & time. */
export default function SettingsDayPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={SETTINGS_COPY.dayAndTime} showBack />}
    >
      <DayTimeForm />
    </PageFrame>
  );
}
