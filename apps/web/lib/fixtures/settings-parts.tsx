"use client";

import { ConnectionsPage, MorningReadingPage } from "@/components/account";

/**
 * Settings › Connections' states on `/dev/parts?state=settings-*`: USE-85's
 * page as `/settings/connections` renders it, so every state of the page
 * and USE-86's clients and sheets is reachable here too.
 */
export function SettingsClientsPart() {
  return <ConnectionsPage />;
}

/**
 * Settings › Morning reading's states on `/dev/parts?state=morning-reading-*`
 * (USE-151): the page as `/settings/morning-reading` renders it.
 */
export function MorningReadingPart() {
  return <MorningReadingPage />;
}
