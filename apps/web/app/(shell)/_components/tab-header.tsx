"use client";

/**
 * TabHeader — a tab's `AppHeader` with the avatar menu at its right (USE-83,
 * D-USE-5). Below the desk only: from 1024 the rail footer is the trigger
 * (D-USE-89), so the header's avatar is hidden by CSS, never by a width read
 * the server would have to guess.
 */
import type * as React from "react";
import { AppHeader } from "@syn/ui";
import { AccountMenu } from "./account";

export function TabHeader({ title }: { title: React.ReactNode }) {
  return (
    <AppHeader
      title={title}
      account={
        <div className="split:hidden">
          <AccountMenu trigger="header" />
        </div>
      }
    />
  );
}
