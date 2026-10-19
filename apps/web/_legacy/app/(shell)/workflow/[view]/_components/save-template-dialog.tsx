"use client";

import * as React from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  HelperText,
  Input,
  StatusLine,
} from "@syn/ui";
import { WORKFLOW_NAME_MAX } from "@syn/constants";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/**
 * A name, asked for once: *Save as a template* (track `DEVIATIONS.md`,
 * authoring 2026-10-03 — one *Name* field, *Cancel* and *Save*; §7 has the
 * strings) and, with another title, *Rename* of a saved template.
 *
 * *Save* creates something, so it is the dialog's verb and it is pending
 * while it saves. An empty name says *A template needs a name.* and saves
 * nothing; a failed save keeps the dialog and the name, with one line.
 */
export function SaveTemplateDialog({
  open,
  onOpenChange,
  returnFocusRef,
  title,
  initialName = "",
  busy,
  error,
  online,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opened from a menu item that is gone by close: focus returns here instead. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  title: string;
  initialName?: string;
  busy: boolean;
  error: string | null;
  online: boolean;
  /** Resolves `true` when it saved — the dialog then closes. */
  onSave: (name: string) => Promise<boolean>;
}) {
  const [name, setName] = React.useState(initialName);
  const [required, setRequired] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(initialName);
    setRequired(false);
  }, [open, initialName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef?.current;
          if (target === null || target === undefined) return;
          event.preventDefault();
          target.focus();
        }}
      >
        <form
          className="flex flex-col gap-(--space-4)"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = name.trim();
            if (trimmed === "") {
              setRequired(true);
              return;
            }
            void onSave(trimmed).then((saved) => {
              if (saved) onOpenChange(false);
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {online ? null : <StatusLine variant="offline" placement="inline" />}
          <Input
            autoFocus
            label={COPY.name}
            value={name}
            maxLength={WORKFLOW_NAME_MAX}
            disabled={!online}
            onChange={(event) => {
              setName(event.target.value);
              if (required) setRequired(false);
            }}
            error={required ? COPY.templateNameRequired : undefined}
          />
          {error === null ? null : <HelperText error>{error}</HelperText>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button type="submit" busy={busy} disabled={!online}>
              {COPY.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
