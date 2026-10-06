"use client";

import { CATEGORY_COPY as COPY } from "@/components/category-sheet";
import { ShellPageHeader } from "@/components/page-frame";
import { useSheet } from "@/lib/hooks/use-sheet";
import { settingsRoute } from "@/lib/routes";

/** CT-01's header: *Categories* and *Add*. */
export function CategoryListHeader() {
  const sheet = useSheet("category");

  return (
    <ShellPageHeader
      title={COPY.listTitle}
      showBack
      backFallback={settingsRoute()}
      action={{
        label: COPY.add,
        onClick: () => {
          sheet.openWith();
        },
      }}
    />
  );
}
