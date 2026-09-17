"use client";

import * as React from "react";

import { Button, HelperText, Input, ResponsiveSheet, Text, TimeField } from "@syn/ui";
import { TEMPLATE_NAME_MAX } from "@syn/constants";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { RotationRows } from "./rotation-rows";

/**
 * Screen 12 — What your work days are about (UX v1.1 §4.11; screen 12 under v1.2 §4 — RUN-8 renumbered the sequence; RUN-11 rebuilds it).
 *
 * "The focuses and their weekly counts." One is fine. The ghost row opens a
 * small sheet for a second work template — a different shape of work day
 * (§3.8: hours, fixtures, whether it has a break) — which most people never
 * open. The template stores a name and a start; *until about* is the
 * profile's `work_end_time` for every work template (there is no end column
 * on the row), and the sheet says so.
 */
export function Step12Focuses({
  initialWorkStart,
  embedded = false,
  onSaved,
}: {
  initialWorkStart: string | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const focuses = trpc.habit.list.useQuery({ includeArchived: false, types: ["deep_work"] });
  const workTemplates = trpc.template.list.useQuery({ includeArchived: false, kind: "work" });
  const create = trpc.template.create.useMutation();
  const update = trpc.template.update.useMutation();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [start, setStart] = React.useState(initialWorkStart ?? "09:00");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const count = (focuses.data?.habits ?? []).filter((habit) => habit.type === "deep_work").length;
  const second = (workTemplates.data ?? []).filter((template) => template.name.trim() !== "");

  async function addSecond(): Promise<void> {
    const trimmed = name.trim();
    if (trimmed === "") {
      setError(COPY.secondWorkNameRequired);
      return;
    }
    setError(null);
    try {
      const created = await create.mutateAsync({ kind: "work" });
      await update.mutateAsync({ id: created.id, patch: { name: trimmed, anchorTime: start } });
      await utils.template.list.invalidate();
      setNotice(COPY.secondWorkDone(trimmed));
      setName("");
      setSheetOpen(false);
    } catch {
      setError(COPY.saveError);
    }
  }

  return (
    <FactScreen
      step={12}
      heading={COPY.step12Heading}
      body={COPY.step12Body}
      save={null}
      primaryLabel={COPY.continueFocuses(count)}
      embedded={embedded}
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-5)">
        <RotationRows kind="deep_work" />

        <div className="flex flex-col gap-(--space-1)">
          <Button variant="ghost" className="self-start" disabled={!online} onClick={() => setSheetOpen(true)}>
            {COPY.differentHours}
          </Button>
          {second.length === 0 ? null : (
            <Text as="p" variant="caption" tone="secondary">
              {second.map((template) => template.name).join(" · ")}
            </Text>
          )}
          {notice === null ? null : (
            <Text as="p" variant="caption" tone="secondary" aria-live="polite">
              {notice}
            </Text>
          )}
        </div>
      </div>

      <SheetHost open={sheetOpen}>
        <ResponsiveSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={COPY.secondWorkTitle}
          initialFocus="first-field"
          footer={
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>
                {COPY.cancel}
              </Button>
              <Button
                disabled={!online}
                busy={create.isPending || update.isPending}
                onClick={() => void addSecond()}
              >
                {COPY.add}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-(--space-4)">
            <Input
              label={COPY.secondWorkName}
              value={name}
              maxLength={TEMPLATE_NAME_MAX}
              onChange={(event) => setName(event.target.value)}
              error={error}
            />
            <TimeField label={COPY.secondWorkStart} value={start} onChange={setStart} required />
            <HelperText>{COPY.secondWorkUntil}</HelperText>
          </div>
        </ResponsiveSheet>
      </SheetHost>
    </FactScreen>
  );
}
