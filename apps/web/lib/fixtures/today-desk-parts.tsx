"use client";

import { Text } from "@syn/ui";
import { TODAY_COPY } from "@/app/(shell)/today/_components/copy";
import { TodayDesk } from "@/app/(shell)/today/_components/desk/today-desk";
import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";

/**
 * USE-58's states on `/dev/parts?state=<scenario>`: the desk's Today frame
 * as the page mounts it, the desk tree from 1024 and Now below it (switched
 * in CSS), under the today-desk scenarios' own names. `&date=` opens a date.
 */
export function TodayDeskPart() {
  return (
    <>
      <div className="split:hidden">
        <NowScreen />
      </div>
      <div className="hidden split:block">
        <TodayDesk
          main={
            <Text as="p" variant="body" tone="muted">
              {TODAY_COPY.placeholder}
            </Text>
          }
        />
      </div>
    </>
  );
}
