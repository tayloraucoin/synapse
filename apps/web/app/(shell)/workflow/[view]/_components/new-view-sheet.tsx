"use client";

import { MoreVertical } from "lucide-react";
import * as React from "react";

import type { WorkflowTemplateView, WorkflowViewTab } from "@syn/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HelperText,
  Input,
  LargeTargetRow,
  ResponsiveSheet,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import { WORKFLOW_NAME_MAX } from "@syn/constants";

import { trpc } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { SaveTemplateDialog } from "./save-template-dialog";
import { MENU_TRIGGER } from "./task-menu";

/**
 * WF-03 — name a view and pick where its columns start (Workflow UX v0.1 §4).
 *
 * *Name* (40; *A view needs a name.*) · *Start from*: the built-in two, then
 * the saved templates in created order, each a stacked `LargeTargetRow` option
 * in the R56 selection grammar whose second line is its columns joined by
 * middots. Saved templates carry a menu — *Rename* · *Archive* — beside the
 * card; the built-in two carry none. NOTHING IS PRESELECTED, and *Create view*
 * is disabled until a name and a choice exist; it is pending while it saves.
 * On success the new view opens (no toast: the new tab is the confirmation);
 * a failure keeps the sheet, the name and the choice, with one line.
 *
 * At the foot, when any exist: *Archived views*, each with *Restore*.
 */
export function NewViewSheet({
  open,
  onClose,
  online,
  archivedViews,
  creating,
  savingTemplate,
  error,
  clearError,
  onCreate,
  onRestoreView,
  onRenameTemplate,
  onArchiveTemplate,
}: {
  open: boolean;
  onClose: () => void;
  online: boolean;
  archivedViews: readonly WorkflowViewTab[];
  creating: boolean;
  savingTemplate: boolean;
  error: string | null;
  clearError: () => void;
  onCreate: (name: string, from: string) => Promise<boolean>;
  onRestoreView: (id: string) => void;
  onRenameTemplate: (id: string, name: string) => Promise<boolean>;
  onArchiveTemplate: (id: string) => void;
}) {
  const templates = trpc.workflow.template.list.useQuery(undefined, { enabled: open });
  const [name, setName] = React.useState("");
  const [from, setFrom] = React.useState<string | null>(null);
  const [nameRequired, setNameRequired] = React.useState(false);
  const [renamingTemplate, setRenamingTemplate] = React.useState<WorkflowTemplateView | null>(null);

  // Each opening starts empty — nothing preselected.
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setFrom(null);
    setNameRequired(false);
    clearError();
  }, [open, clearError]);

  // A template archived elsewhere drops out of the choice when the list refetches.
  const list = templates.data;
  React.useEffect(() => {
    if (from !== null && list !== undefined && !list.some((template) => template.id === from)) setFrom(null);
  }, [from, list]);

  const ready = name.trim() !== "" && from !== null && online;

  const submit = () => {
    if (name.trim() === "") {
      setNameRequired(true);
      return;
    }
    if (from === null || !online) return;
    void onCreate(name.trim(), from);
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={COPY.newView}
      initialFocus="first-field"
      footer={
        <div className="flex items-center justify-end gap-(--space-3)">
          <Button variant="ghost" onClick={onClose}>
            {COPY.cancel}
          </Button>
          <Button disabled={!ready} busy={creating} onClick={submit}>
            {COPY.createView}
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-(--space-5)"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {online ? null : <StatusLine variant="offline" placement="inline" />}

        <Input
          label={COPY.name}
          value={name}
          maxLength={WORKFLOW_NAME_MAX}
          disabled={!online}
          onChange={(event) => {
            setName(event.target.value);
            if (nameRequired) setNameRequired(false);
          }}
          onBlur={() => setNameRequired(name !== "" && name.trim() === "")}
          error={nameRequired ? COPY.viewNameRequired : undefined}
        />

        {list === undefined ? (
          <div className="flex flex-col gap-(--space-2)" aria-hidden="true">
            <SkeletonRow leading={false} />
            <SkeletonRow leading={false} />
          </div>
        ) : (
          <LargeTargetRow
            label={COPY.startFrom}
            layout="stacked"
            value={from}
            onChange={setFrom}
            disabled={!online}
            options={list.map((template) => ({
              value: template.id,
              label: template.name,
              description: template.columns.map((column) => column.name).join(" · "),
              trailing: template.builtIn ? undefined : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={COPY.templateOptions(template.name)}
                    disabled={!online}
                    className={MENU_TRIGGER}
                  >
                    <MoreVertical className="size-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={() => setRenamingTemplate(template)}>{COPY.rename}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onArchiveTemplate(template.id)}>{COPY.archive}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            }))}
          />
        )}

        {error === null ? null : <HelperText error>{error}</HelperText>}

        {archivedViews.length === 0 ? null : (
          <section className="flex flex-col gap-(--space-2)">
            <Text as="h3" variant="secondary" weight={500}>
              {COPY.archivedViews}
            </Text>
            <ul className="m-0 flex list-none flex-col p-0">
              {archivedViews.map((view) => (
                <li key={view.id} className="flex min-h-(--row-min) items-center justify-between gap-(--space-3)">
                  <Text as="span" variant="body" truncate>
                    {view.name}
                  </Text>
                  <Button type="button" variant="ghost" disabled={!online} onClick={() => onRestoreView(view.id)}>
                    {COPY.restore}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </form>

      <SaveTemplateDialog
        open={renamingTemplate !== null}
        onOpenChange={(next) => {
          if (!next) setRenamingTemplate(null);
        }}
        title={COPY.rename}
        initialName={renamingTemplate?.name ?? ""}
        busy={savingTemplate}
        error={renamingTemplate === null ? null : error}
        online={online}
        onSave={(next) =>
          renamingTemplate === null ? Promise.resolve(false) : onRenameTemplate(renamingTemplate.id, next)
        }
      />
    </ResponsiveSheet>
  );
}
