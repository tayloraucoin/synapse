"use client";

import { OfflineIcon, StatusLine } from "@syn/ui";

/**
 * OfflineLine — no connection (USE-21; D-USE-56): one StatusLine under the
 * screen's header, above the To-dos tray, with the cloud-off glyph and its
 * words. Offline is not an error: nothing else changes and every check works.
 * The caller renders it only while offline. Props only.
 */
export interface OfflineLineProps {
  /** "Offline. Checks are saved on this phone." */
  text: string;
}

export function OfflineLine({ text }: OfflineLineProps) {
  return (
    <StatusLine
      variant="offline"
      text={
        <span className="flex items-center gap-(--space-2)">
          <OfflineIcon aria-hidden="true" className="size-4 shrink-0" />
          {text}
        </span>
      }
    />
  );
}
