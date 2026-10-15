"use client";

import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";

/**
 * USE-83's states on `/dev/parts?state=<scenario>`: a tab's header with the
 * avatar menu, over a muted line, since the tabs' own screens are their
 * tickets'. The part names are the account scenarios' names, so the menu
 * reads the same `?state=`; `account-*` open the menu on load, and `install-*`
 * are taken with `&sheet=install` and `profile-*` with `&sheet=profile`
 * (USE-84). At 1024 and up the rail footer's avatar
 * is the trigger.
 */

const COPY = { title: "Now", line: "Now is drawn by its own ticket." };

export function AccountPart() {
  return (
    <>
      <TabHeader title={COPY.title} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.line}
        </Text>
      </ScreenFrame>
    </>
  );
}
