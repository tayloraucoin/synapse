"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AppHeader, Button, HelperText, Input, SkeletonRow, StatusLine, Text } from "@syn/ui";
import { TEMPLATE_NAME_MAX } from "@syn/constants";
import type { SlotView } from "@syn/types";

import { PageFrame } from "@/components/page-frame";
import { WEEK_COPY } from "@/components/week-build/copy";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { AddSheet } from "./add-sheet";
import { ApplyChangesDialog } from "./apply-changes-dialog";
import { BlockStrip } from "./block-strip";
import { BLOCK_EDITOR_COPY as COPY } from "./copy";
import { EditorFooter } from "./editor-footer";
import { SlotSheet } from "./slot-sheet";
import { useBlockEditor } from "./use-block-editor";

/** How long *Applied to {n} days.* stays up before the screen leaves (TP-04). */
const APPLIED_NOTICE_MS = 4000;

/**
 * The block editor — UX v1.1 §3.11 (DYN-8). One editing surface for any
 * block template: the strip, the footer, *Add*, and the slot sheet.
 *
 * THE HOOK IS CALLED ONCE, HERE. The name field lives in the header and
 * every slot write refreshes through the same editor, so the one save status
 * a person reads is the status of everything they just did (TP-02's rule,
 * kept).
 *
 * `embedded` is DYN-11's: first-run screens 7, 9 and 10 render the strip and
 * the sheets inside their own `StepFrame`, without this header. The name is
 * then the screen's, not the editor's.
 */
export interface BlockEditorProps {
  templateId: string;
  embedded?: boolean;
  /** Where back goes once the leave rules have run. */
  exitHref?: string;
}

export function BlockEditor({ templateId, embedded = false, exitHref }: BlockEditorProps) {
  const router = useRouter();
  const online = useOnline();
  const editor = useBlockEditor(templateId);
  const discardIfEmpty = trpc.template.discardIfEmpty.useMutation();

  const [nameError, setNameError] = React.useState<string | null>(null);
  const [askApply, setAskApply] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SlotView | null>(null);

  const { template, slots, walk } = editor;
  // The sheet edits the live row: after a save the strip's slot is the fresh one.
  const editingSlot = editing === null ? null : (slots.find((slot) => slot.id === editing.id) ?? null);

  const exit = React.useCallback((): void => {
    if (exitHref === undefined) return;
    // A draft nobody named and nothing was put in is not a template.
    void discardIfEmpty
      .mutateAsync({ id: templateId })
      .catch(() => undefined)
      .finally(() => {
        router.push(exitHref);
      });
  }, [discardIfEmpty, exitHref, router, templateId]);

  function leave(): void {
    // Held once when there are slots and no name; the second attempt leaves.
    if (!editor.validateForLeave()) {
      setNameError(COPY.nameRequired);
      return;
    }
    // TP-04: the days already using this template are asked about on the way
    // out, and only when there are some and something actually changed.
    if (editor.hasChanged() && editor.appliedDays > 0) {
      setAskApply(true);
      return;
    }
    exit();
  }

  React.useEffect(() => {
    if (notice === null) return;
    const timer = window.setTimeout(exit, APPLIED_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice, exit]);

  const readOnly = editor.archived || !online;

  const body = editor.detail.isLoading ? (
    <div className="flex flex-col gap-(--space-2)">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  ) : template === undefined ? null : (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}
      {editor.saveFailed ? (
        <Text as="p" tone="secondary">
          {COPY.saveFailed}
        </Text>
      ) : null}

      {embedded ? (
        <Text as="p" variant="caption" tone="secondary">
          {COPY.anchorLine(template.kind, template.anchorClock)}
        </Text>
      ) : null}

      <BlockStrip
        slots={slots}
        walk={walk}
        onOpen={(slot) => setEditing(slot)}
        onAdd={() => setAddOpen(true)}
        disabled={readOnly}
      />

      {/* The footer and *Add* sit together, within thumb reach (§3.11). */}
      <div className="bg-paper sticky bottom-0 flex flex-col gap-(--space-3) pb-(--space-2)">
        <EditorFooter kind={template.kind} walk={walk} />
        {readOnly ? null : (
          <Button variant="secondary" className="w-full" onClick={() => setAddOpen(true)}>
            {COPY.add}
          </Button>
        )}
      </div>

      <AddSheet
        open={addOpen}
        templateId={templateId}
        kind={template.kind}
        onOpenChange={setAddOpen}
        onAdded={editor.refresh}
      />

      <SlotSheet
        open={editingSlot !== null}
        templateId={templateId}
        structure={template.structure}
        slot={editingSlot}
        slots={slots}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        onChanged={editor.refresh}
      />

      {embedded ? null : (
        <ApplyChangesDialog
          open={askApply}
          templateId={templateId}
          templateName={template.name}
          onDone={(applied) => {
            setAskApply(false);
            if (applied === null) {
              setNotice(WEEK_COPY.applyError);
              return;
            }
            if (applied === 0) {
              exit();
              return;
            }
            setNotice(WEEK_COPY.appliedResult(applied));
          }}
        />
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <PageFrame
      contentWidth="canvas"
      header={
        <div className="flex flex-col">
          <AppHeader
            title={
              <Input
                aria-label={COPY.nameLabel}
                defaultValue={template?.name ?? ""}
                maxLength={TEMPLATE_NAME_MAX}
                disabled={editor.archived}
                onChange={(event) => {
                  if (nameError !== null) setNameError(null);
                  editor.patch({ name: event.target.value });
                }}
                classes={{
                  input: "border-transparent px-0 text-(length:--fs-heading) font-semibold",
                }}
              />
            }
            subtitle={
              notice ??
              (template === undefined
                ? undefined
                : editor.appliedDays > 0
                  ? `${COPY.anchorLine(template.kind, template.anchorClock)} · ${COPY.appliedDays(editor.appliedDays)}`
                  : COPY.anchorLine(template.kind, template.anchorClock))
            }
            saveStatus={editor.status}
            onBack={leave}
          />
          {nameError === null ? null : (
            <div className="px-(--space-4) pb-(--space-2)">
              <HelperText error>{nameError}</HelperText>
            </div>
          )}
        </div>
      }
    >
      {body}
    </PageFrame>
  );
}
