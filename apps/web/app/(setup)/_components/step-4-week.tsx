"use client";

import * as React from "react";

import { Button, SkeletonRow } from "@syn/ui";

import { TemplateEditor, useTemplateEditor } from "@/components/template-editor";
import { WeekCanvas } from "@/components/week-build";
import { setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { rememberSetupTemplateId } from "./setup-template-id";
import { StepFrame, useStepNavigation } from "./step-frame";

/**
 * FR-04 — apply the template to the days that actually want planning.
 *
 * *BUILD ONE* STAYS INSIDE THE SEQUENCE. Someone who skipped FR-03 and then
 * decides they do want a template should not be navigated to Settings at step
 * 4 of 5 and left there. The editor swaps in over the week and *Done* swaps it
 * back, which is TP-02 whole, in place.
 *
 * THE WEEK COMES FROM THE SERVER, already resolved for the weekend rule
 * (Epic 1 §13.2): planning "this week" on a Sunday afternoon means planning a
 * week with nothing left in it.
 */
export function Step4Week({ weekKey }: { weekKey: string }) {
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();
  const create = trpc.template.create.useMutation();
  const update = trpc.template.update.useMutation();

  const [building, setBuilding] = React.useState<string | null>(null);

  async function buildOne(): Promise<void> {
    const created = await create.mutateAsync();
    await update
      .mutateAsync({ id: created.id, patch: { name: COPY.firstTemplateName } })
      .catch(() => undefined);
    rememberSetupTemplateId(created.id);
    await utils.template.list.invalidate();
    setBuilding(created.id);
  }

  return (
    <StepFrame
      step={4}
      heading={COPY.step4Heading}
      body={COPY.step4Body}
      skip={{ onSkip: () => void goTo(5, setupRoute(5)) }}
      primary={{
        label: COPY.continue,
        onClick: () => void goTo(5, setupRoute(5)),
      }}
    >
      {building === null ? (
        <WeekCanvas
          weekKey={weekKey}
          embedded
          onBuildTemplate={() => void buildOne()}
        />
      ) : (
        <div className="flex flex-col gap-(--space-3)">
          <EmbeddedEditor templateId={building} />
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => {
              void utils.template.list.invalidate();
              setBuilding(null);
            }}
          >
            {COPY.backToWeek}
          </Button>
        </div>
      )}

      {create.isPending ? <SkeletonRow /> : null}
    </StepFrame>
  );
}

function EmbeddedEditor({ templateId }: { templateId: string }) {
  const editor = useTemplateEditor(templateId);
  return <TemplateEditor templateId={templateId} editor={editor} embedded />;
}
