"use client";

import Link from "next/link";
import { AddIcon, DisclosureIcon, Text } from "@syn/ui";
import { REVIEW_EDITS_COPY as COPY } from "./edits-copy";

/**
 * A Work block with nothing slotted (USE-37; no-work.md; D-USE-2, D-USE-22):
 * under its head, where work is set, then Add to Primary and Add to
 * Secondary (each a `--target` row opening the add sheet preset to its
 * tier) and Open This week (a link, Set my days at today's Work block). No
 * tier sub-heads, and no Add to Urgent or Add to Stretch here.
 */
export function EmptyWork({
  onAdd,
  weekHref,
}: {
  onAdd: (tier: "primary" | "secondary") => void;
  weekHref: string;
}) {
  return (
    <div data-empty-work className="flex flex-col items-start">
      <Text as="p" variant="secondary" tone="muted" className="pb-(--space-1)">
        {COPY.noWork}
      </Text>
      <AddRow label={COPY.addToPrimary} onAdd={() => onAdd("primary")} />
      <AddRow label={COPY.addToSecondary} onAdd={() => onAdd("secondary")} />
      <Link
        href={weekHref}
        className="pointer-events-auto flex h-(--target) items-center gap-(--space-2) rounded-(--radius-control) font-medium text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <DisclosureIcon aria-hidden="true" className="size-4" />
        {COPY.openThisWeek}
      </Link>
    </div>
  );
}

function AddRow({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex h-(--target) items-center gap-(--space-2) rounded-(--radius-control) text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <AddIcon aria-hidden="true" className="size-4" />
      <Text as="span" variant="body">
        {label}
      </Text>
    </button>
  );
}
