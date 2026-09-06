"use client";

import * as React from "react";

import { SkeletonRow } from "@syn/ui";

import { TemplateEditor, useTemplateEditor } from "@/components/template-editor";
import { setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import {
  forgetSetupTemplateId,
  readSetupTemplateId,
  rememberSetupTemplateId,
} from "./setup-template-id";
import { StepFrame, useStepNavigation } from "./step-frame";

/**
 * FR-03 — one kind of day, built in TP-02 itself.
 *
 * THE EDITOR IS EMBEDDED WHOLE. "All of TP-02's controls are present; nothing
 * is removed for first run" (Epic 1 FR-03). A reduced first-run editor would
 * teach someone a screen that exists nowhere else in the app.
 *
 * THE TEMPLATE IS CREATED ON ENTRY. The editor autosaves, so it needs a row to
 * save into before the person touches anything; the id is remembered for the
 * session so stepping back and forward does not leave a trail of empty
 * *Morning* templates.
 *
 * *SKIP FOR NOW* DELETES IT ONLY IF IT HAS NO SLOTS. This step prefilled the
 * name, so nobody typed it, and a slotless *Morning* left in TP-01 would be a
 * template the person explicitly declined to build. One with slots is work,
 * and work is kept.
 */
export function Step3Template() {
  const goTo = useStepNavigation();
  const create = trpc.template.create.useMutation();
  const update = trpc.template.update.useMutation();
  const discard = trpc.template.discardIfEmpty.useMutation();

  const [templateId, setTemplateId] = React.useState<string | null>(null);
  // Guards the one-time creation. The effect may re-run when tRPC hands back
  // new mutation objects; this is what makes that harmless, so the deps list
  // can stay honest instead of being suppressed.
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;

    const remembered = readSetupTemplateId();
    if (remembered !== null) {
      setTemplateId(remembered);
      return;
    }

    void create.mutateAsync().then(async (created) => {
      // `create` already writes the account's usual wake time as the anchor,
      // which is FR-01's answer. Only the name has to be prefilled.
      await update
        .mutateAsync({
          id: created.id,
          patch: { name: COPY.firstTemplateName },
        })
        .catch(() => undefined);
      rememberSetupTemplateId(created.id);
      setTemplateId(created.id);
    });
  }, [create, update]);

  async function onSkip(): Promise<void> {
    if (templateId !== null) {
      await discard
        .mutateAsync({ id: templateId, requireUnnamed: false })
        .catch(() => undefined);
      forgetSetupTemplateId();
    }
    await goTo(4, setupRoute(4));
  }

  return (
    <StepFrame
      step={3}
      heading={COPY.step3Heading}
      body={COPY.step3Body}
      skip={{ onSkip: () => void onSkip(), busy: discard.isPending }}
      primary={{
        label: COPY.continue,
        onClick: () => void goTo(4, setupRoute(4)),
        busy: templateId === null,
      }}
    >
      {templateId === null ? (
        <div className="flex flex-col gap-(--space-2)">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <EmbeddedEditor templateId={templateId} />
      )}
    </StepFrame>
  );
}

/**
 * The editor and its hook, in a child so the hook runs only once an id exists.
 * `useTemplateEditor` fetches by id, and calling it with a placeholder while
 * the row is still being created would request a template that does not exist.
 */
function EmbeddedEditor({ templateId }: { templateId: string }) {
  const editor = useTemplateEditor(templateId);
  return <TemplateEditor templateId={templateId} editor={editor} embedded />;
}
