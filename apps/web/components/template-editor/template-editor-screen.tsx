"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AppHeader, HelperText, Input } from "@syn/ui";
import { TEMPLATE_NAME_MAX } from "@syn/constants";

import { PageFrame } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";
import { settingsTemplatesRoute } from "@/lib/routes";

import { TEMPLATE_COPY as COPY } from "./copy";
import { TemplateEditor } from "./template-editor";
import { useTemplateEditor } from "./use-template-editor";

/**
 * TP-02 as a whole screen: the header and the canvas, sharing one editor.
 *
 * THE HOOK IS CALLED ONCE, HERE. The name field lives in the header and the
 * settings row lives in the body, and both autosave — through the same queue,
 * so a name keystroke and an anchor change cannot race, and the one save
 * status a person reads is the status of everything they just did.
 *
 * THE NAME IS THE SCREEN'S `h1` (Epic 1 TP-02 read 1): an inline field passed
 * as the header's title, not a heading with a field under it. A template's
 * name and the screen's name are the same fact.
 */
export function TemplateEditorScreen({ templateId }: { templateId: string }) {
  const router = useRouter();
  const editor = useTemplateEditor(templateId);
  const discardIfEmpty = trpc.template.discardIfEmpty.useMutation();
  const [nameError, setNameError] = React.useState<string | null>(null);

  function leave(): void {
    // Held once when there are slots and no name; the second attempt leaves.
    if (!editor.validateForLeave()) {
      setNameError(COPY.nameRequired);
      return;
    }
    // A draft nobody named and nothing was put in is not a template.
    void discardIfEmpty
      .mutateAsync({ id: templateId })
      .catch(() => undefined)
      .finally(() => {
        router.push(settingsTemplatesRoute());
      });
  }

  return (
    <PageFrame
      contentWidth="canvas"
      header={
        <div className="flex flex-col">
          <AppHeader
            title={
              <Input
                aria-label={COPY.nameLabel}
                defaultValue={editor.template?.name ?? ""}
                maxLength={TEMPLATE_NAME_MAX}
                disabled={editor.archived}
                onChange={(event) => {
                  if (nameError !== null) setNameError(null);
                  editor.patch({ name: event.target.value });
                }}
                classes={{
                  input:
                    "border-transparent px-0 text-(length:--fs-heading) font-semibold",
                }}
              />
            }
            subtitle={
              editor.appliedDays > 0
                ? COPY.appliedDays(editor.appliedDays)
                : undefined
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
      <TemplateEditor templateId={templateId} editor={editor} />
    </PageFrame>
  );
}
