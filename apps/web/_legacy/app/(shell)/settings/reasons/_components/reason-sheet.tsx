"use client";

import * as React from "react";

import {
  Button,
  DiscardDialog,
  HelperText,
  Input,
  ResponsiveSheet,
  TierRadioRows,
} from "@syn/ui";
import { REASON_LABEL_MAX } from "@syn/constants";
import type { MissTier, ReasonView } from "@syn/types";

import { REMINDER_COPY as COPY } from "@/components/reminder-prompt";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

/**
 * ST-06a — one reason, and what it counts as.
 *
 * THE DEFAULT TIER IS *PLANNED IT WRONG* (`scoping`) — Vesper's call, signed
 * in the ticket: it is the least presumptuous of the three. Defaulting to
 * *Something came up* would forgive by default; defaulting to *Didn't do it*
 * would accuse by default. The middle tier assumes only that the plan was off.
 *
 * A STRUCTURAL ROW'S LABEL IS EDITABLE AND ITS TIER IS NOT. *Didn't do it* IS
 * the `chose_not_to` tier — letting it move would make the three headings mean
 * something different per account — but a person may call it whatever they
 * like, because the label is theirs.
 *
 * UNIQUENESS IS THE SERVER'S ANSWER. It is a question about the person's other
 * rows, so the sheet renders the sentence the service raises rather than
 * checking a list it fetched a moment ago.
 */
export function ReasonSheet({
  open,
  reason,
  structural,
  onOpenChange,
}: {
  open: boolean;
  /** Null for *New reason*. */
  reason: ReasonView | null;
  /** Whether the row being edited is structural — its tier is locked. */
  structural: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const create = trpc.reason.create.useMutation();
  const update = trpc.reason.update.useMutation();

  const [label, setLabel] = React.useState("");
  const [tier, setTier] = React.useState<MissTier>("scoping");
  const [error, setError] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setLabel(reason?.label ?? "");
    setTier(reason?.tier ?? "scoping");
  }, [open, reason]);

  const editing = reason !== null;
  const dirty = label !== (reason?.label ?? "") || tier !== (reason?.tier ?? "scoping");

  async function submit(): Promise<void> {
    setError(null);
    try {
      if (editing) {
        await update.mutateAsync({ key: reason.key, label, tier });
      } else {
        await create.mutateAsync({ label, tier });
      }
      await utils.reason.list.invalidate();
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : COPY.duplicateReason,
      );
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next && dirty) {
            setDiscardOpen(true);
            return;
          }
          onOpenChange(next);
        }}
        title={editing ? COPY.editReason : COPY.newReason}
        dirty={dirty}
        onDiscardRequest={() => setDiscardOpen(true)}
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button
              busy={create.isPending || update.isPending}
              disabled={!online || label.trim() === ""}
              onClick={() => void submit()}
            >
              {COPY.save}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <Input
            label={COPY.reasonLabel}
            value={label}
            maxLength={REASON_LABEL_MAX}
            onChange={(event) => setLabel(event.target.value)}
          />

          <TierRadioRows
            label={COPY.countsAs}
            value={tier}
            onChange={setTier}
            // The three definition lines are the component's own — official
            // spec §10.2's phrases, in one place for every surface.
            lockedTier={structural ? tier : null}
          />

          {structural ? <HelperText>{COPY.tierLocked}</HelperText> : null}
          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          onOpenChange(false);
        }}
      />
    </SheetHost>
  );
}
