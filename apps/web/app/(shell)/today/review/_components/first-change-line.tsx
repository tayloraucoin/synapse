"use client";

import { Text } from "@syn/ui";
import { REVIEW_EDITS_COPY as COPY } from "./edits-copy";

/**
 * The first-change line (USE-37; first-edit.md): a full-width band under
 * the header, above the tray, the surface fill and a hairline under it,
 * "Changes apply to today. Monday's usual stays as it is." in muted label.
 * The tray and the column move down by its height. Announced politely, once:
 * it mounts on the first change and stays for the visit.
 */
export function FirstChangeLine({ dateKey }: { dateKey: string }) {
  return (
    <div
      role="status"
      data-first-change
      className="border-b border-border bg-surface px-(--space-4) py-(--space-2)"
    >
      <Text as="p" variant="secondary" tone="muted">
        {COPY.firstChange(dateKey)}
      </Text>
    </div>
  );
}
