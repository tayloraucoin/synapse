import type { Metadata } from "next";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { settingsYourDayRoute } from "@/lib/routes";

import { YOUR_DAY_COPY } from "../_components/copy";
import { BlockOrder } from "./_components/block-order";

export const metadata: Metadata = { title: YOUR_DAY_COPY.orderTitle };

/** Settings → Your day → Block order — UX v1.1 §4.14 (DYN-8). */
export default function SettingsBlockOrderPage() {
  return (
    <PageFrame
      header={
        <ShellPageHeader title={YOUR_DAY_COPY.orderTitle} showBack backFallback={settingsYourDayRoute()} />
      }
    >
      <BlockOrder />
    </PageFrame>
  );
}
