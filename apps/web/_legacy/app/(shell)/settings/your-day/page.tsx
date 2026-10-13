import type { Metadata } from "next";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { settingsRoute } from "@/lib/routes";

import { YOUR_DAY_COPY } from "./_components/copy";
import { YourDayList } from "./_components/your-day-list";

export const metadata: Metadata = { title: YOUR_DAY_COPY.title };

/** Settings → Your day — UX v1.1 §4.14 (DYN-8). */
export default function SettingsYourDayPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={YOUR_DAY_COPY.title} showBack backFallback={settingsRoute()} />}
    >
      <YourDayList />
    </PageFrame>
  );
}
