"use client";

/**
 * WorkspaceSheet — whose work a Linear workspace's projects are (USE-86;
 * account/settings/states/workspace-per-project.md). Opened by a clients-on
 * workspace row's chevron (D-USE-91).
 *
 * ONE CLIENT or SET PER PROJECT. One client is one Select for the whole
 * workspace [ASSUMPTION: not drawn]; per project, each project's Select lists
 * "No client" and the clients in Settings order. A pick saves at once; "No
 * client" puts that project's work under Personal, and an unmapped project
 * never takes a client from its workspace (USE-9's `resolveClient`).
 *
 * NOTHING HERE WRITES TO LINEAR: not a mapping and not an emoji
 * (C-USE-settings-workspace-per-project-2). The emoji is Linear's; setting
 * one here waits for somewhere to store it (out of scope).
 *
 * Disconnect <workspace> sits at the foot and closes the sheet.
 */
import * as React from "react";
import {
  Button,
  CloseIcon,
  HueSquare,
  ResponsiveSheet,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@syn/ui";
import type { ClientRecord } from "@syn/validators";
import type { WorkspaceMapping } from "@/lib/data/clients-settings";
import { CLIENTS_COPY } from "./copy";

const COPY = CLIENTS_COPY.workspace;

/** The Select's value for no client (a Select item cannot hold an empty value). */
const NONE = "none";

type Mode = "one" | "per-project";

export interface WorkspaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: WorkspaceMapping | null;
  /** Not archived, in Settings order. */
  clients: readonly ClientRecord[];
  /** "synced 2 min ago", live. */
  synced: string;
  onPerProject: (perProject: boolean) => void;
  /** No `projectId`: the workspace's one client. */
  onMap: (projectId: string | undefined, clientId: string | null) => void;
  onDisconnect: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/** The client's square in a trigger or a list: ink is a plain square. */
function ClientSquare({ client }: { client: ClientRecord }) {
  return client.colorKey === "ink" ? (
    <span
      aria-hidden="true"
      className="bg-foreground size-2 shrink-0 rounded-(--radius-sm)"
    />
  ) : (
    <HueSquare hue={client.colorKey} />
  );
}

function ClientSelect({
  label,
  value,
  clients,
  onChange,
}: {
  label: string;
  value: string | null;
  clients: readonly ClientRecord[];
  onChange: (clientId: string | null) => void;
}) {
  const picked = clients.find((c) => c.id === value) ?? null;
  return (
    <Select
      value={picked?.id ?? NONE}
      onValueChange={(next) => onChange(next === NONE ? null : next)}
    >
      <SelectTrigger
        aria-label={COPY.projectClient(label, picked?.name ?? COPY.noClient)}
        className="min-h-(--target) w-fit max-w-1/2 min-w-0 shrink-0"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        <SelectItem value={NONE}>{COPY.noClient}</SelectItem>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            <span className="inline-flex min-w-0 items-center gap-(--space-2)">
              <ClientSquare client={client} />
              <span className="truncate">{client.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function WorkspaceSheet({
  open,
  onOpenChange,
  mapping: given,
  clients,
  synced,
  onPerProject,
  onMap,
  onDisconnect,
  returnFocusRef,
}: WorkspaceSheetProps) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  // The workspace stays drawn while the sheet closes (Disconnect removes it).
  const [kept, setKept] = React.useState(given);
  if (open && given !== null && kept !== given) setKept(given);
  const mapping = open && given !== null ? given : kept;
  const name = mapping?.connection.organizationName ?? "";
  const mode: Mode = mapping?.connection.perProject ? "per-project" : "one";

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const header = (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-(--space-2)">
        <Text
          ref={titleRef}
          as="h2"
          variant="heading"
          weight={600}
          tabIndex={-1}
          className="flex-1 truncate outline-none"
        >
          {name}
        </Text>
        <Button
          variant="ghost"
          size="icon"
          aria-label={CLIENTS_COPY.close}
          onClick={() => onOpenChange(false)}
          className="-me-(--space-3)"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      </div>
      <Text as="p" variant="caption" tone="muted">
        {COPY.line(synced)}
      </Text>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open && mapping !== null}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
      title={name}
      header={header}
      headerAction={null}
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "items-start pt-(--space-2)",
        body: "pt-(--space-2)",
      }}
    >
      {mapping ? (
        <div className="flex flex-col gap-(--space-6)">
          <SegmentedControl<Mode>
            label={
              <Text as="span" variant="secondary" weight={600}>
                {COPY.whose}
              </Text>
            }
            value={mode}
            onChange={(next) => onPerProject(next === "per-project")}
            options={[
              { value: "one", label: COPY.oneClient },
              { value: "per-project", label: COPY.perProject },
            ]}
          />

          {mode === "one" ? (
            <div className="border-border flex min-h-(--row-min) items-center gap-(--space-3) border-b">
              <Text as="span" variant="body" className="flex-1">
                {COPY.workspaceClient}
              </Text>
              <ClientSelect
                label={name}
                value={mapping.connection.clientId}
                clients={clients}
                onChange={(clientId) => onMap(undefined, clientId)}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <Text as="p" variant="caption" tone="muted">
                {COPY.projects}
              </Text>
              <ul className="m-0 flex list-none flex-col p-0">
                {mapping.projects.map((project) => (
                  <li
                    key={project.id}
                    className="border-border flex min-h-(--row-min) items-center gap-(--space-3) border-b"
                  >
                    {project.icon ? (
                      <span
                        aria-hidden="true"
                        className="w-6 shrink-0 text-center"
                      >
                        {project.icon}
                      </span>
                    ) : null}
                    <Text
                      as="span"
                      variant="body"
                      className="min-w-0 flex-1 truncate"
                    >
                      {project.name}
                    </Text>
                    <ClientSelect
                      label={project.name}
                      value={project.clientId}
                      clients={clients}
                      onChange={(clientId) => onMap(project.id, clientId)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Text as="p" variant="caption" tone="muted">
            {COPY.footnote}
          </Text>

          <button
            type="button"
            onClick={onDisconnect}
            className="text-destructive-text self-start rounded-(--radius-sm) py-(--space-2) text-start text-(length:--fs-body) hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {COPY.disconnect(name)}
          </button>
        </div>
      ) : null}
    </ResponsiveSheet>
  );
}
