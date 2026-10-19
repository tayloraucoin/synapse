"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import {
  Button,
  CloseIcon,
  DateField,
  Input,
  ResponsiveSheet,
  Text,
  toastUndo,
} from "@syn/ui";
import { useDataSource } from "@/lib/data/source";
import { usePool } from "@/lib/data/use-pool";
import { deriveSetUpDay, type SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeekQuery } from "@/lib/data/use-week";
import { refusalWords, useWorkWrites } from "@/lib/data/use-work-writes";
import type { WeekRecords } from "@/lib/data/week-records";
import { ClientTile } from "../../index";
import { NEW_TASK_COPY as COPY } from "../copy";
import {
  ClientPicker,
  DaysField,
  SizeField,
  TierField,
  ValueRow,
  type ClientOption,
} from "./fields";
import {
  actionWords,
  canSave,
  dueWords,
  emptyDraft,
  fitLine,
  landedWords,
  pickSize,
  rangeWords,
  readWeekFit,
  shortDate,
  sizeWords,
  toCreateTask,
  toggleDay,
  weekOf,
  type NewTaskDraft,
} from "./form";

/**
 * NewTaskSheet — Task to a tier (USE-51; add/states/new-task.md,
 * save-to-the-pool.md, D-USE-54, D-USE-57, D-USE-65): title, client and
 * project, tier, size and days, the fit line and an action that names the
 * days. Two or more days are sessions of one task; no days saves to the
 * pool and nothing goes to Linear. A toast names where it went, with Undo.
 *
 * From the pool with no days it opens as the pool's rows (Client and
 * project, Size, Due, Days), each opening its picker; picking a day turns
 * it into the full form [ASSUMPTION, as save-to-the-pool.md]. At the desk
 * ResponsiveSheet opens it in the right panel at `--sheet-w`.
 */
export interface NewTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The day it was opened on: its week's days are offered. */
  dateKey: string;
  /** The block it was opened from, which wins on its own date. */
  blockId?: string;
  /** "+ Add to <tier>" opens with the tier set (D-USE-41). */
  tier?: WorkTier;
  from: "add" | "pool";
  /** A draft to start from (a capture's, or a search's words). */
  initial?: Partial<NewTaskDraft>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

interface WeekRead {
  days: SetUpDay[];
  timeZone: string;
}

function selectWeek(records: WeekRecords): WeekRead {
  return {
    days: records.days.map((day) => deriveSetUpDay(day, records.timeZone)),
    timeZone: records.timeZone,
  };
}

type Picker = "client" | "size" | "due" | "days" | null;

export function NewTaskSheet({
  open,
  onOpenChange,
  dateKey,
  blockId,
  tier,
  from,
  initial,
  returnFocusRef,
}: NewTaskSheetProps) {
  const source = useDataSource();
  const writes = useWorkWrites();
  const pool = usePool().pool;
  const week = useWeekQuery(weekOf(dateKey).key, selectWeek).data;
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const fresh = (): NewTaskDraft => ({ ...emptyDraft(tier), ...initial });
  const [draft, setDraft] = React.useState<NewTaskDraft>(fresh);
  const [picker, setPicker] = React.useState<Picker>(null);
  const [full, setFull] = React.useState(
    () => from === "add" || (initial?.days?.length ?? 0) > 0,
  );
  const [error, setError] = React.useState<string | null>(null);

  // Each open starts from the props as they are then.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const next = fresh();
      setDraft(next);
      setFull(from === "add" || next.days.length > 0);
      setPicker(null);
      setError(null);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const fit = readWeekFit({
    days: week?.days ?? [],
    today: source.todayKey(),
    timeZone: week?.timeZone ?? source.scenario.records.timeZone,
    picked: draft.days,
    blockId,
  });

  const clients: ClientOption[] = (pool?.clientsEnabled ? pool.groups : [])
    .flatMap((group) => (group.client === null ? [] : [group.client]))
    .map((client) => ({
      id: client.id,
      name: client.name,
      letter: client.name.charAt(0).toUpperCase(),
      hue: client.colorKey,
    }));
  const client = clients.find((c) => c.id === draft.clientId) ?? null;
  const clientValue = COPY.clientValue(
    client?.name ?? COPY.noClient,
    COPY.noProject,
  );

  const homeChip = fit.chips.find((chip) => chip.dateKey === dateKey);
  const context =
    from === "pool"
      ? COPY.poolContext
      : COPY.context(shortDate(dateKey), homeChip?.block?.name ?? "");

  function change(next: NewTaskDraft) {
    setDraft(next);
    setError(null);
  }

  function toggle(dateKey: string) {
    const next = toggleDay(draft, dateKey);
    change(next);
    if (next.days.length > 0) setFull(true);
  }

  async function save() {
    if (!canSave(draft, fit)) return;
    try {
      const done = await writes.createTask(toCreateTask(draft, fit));
      onOpenChange(false);
      toastUndo({
        text: landedWords(draft),
        onUndo: () => void writes.undo(done.undo),
      });
    } catch (cause) {
      setError(refusalWords(cause) ?? COPY.notSaved);
    }
  }

  const togglePicker = (next: Exclude<Picker, null>) => () =>
    setPicker((open) => (open === next ? null : next));

  const header = (
    <div className="flex min-w-0 flex-1 flex-col">
      {from === "add" ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => onOpenChange(false)}
          className="text-foreground -ms-(--space-3) self-start"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      ) : null}
      <Text as="p" variant="caption" tone="muted">
        {context}
      </Text>
      <Text
        ref={headingRef}
        as="h2"
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>
    </div>
  );

  const actionId = React.useId();
  const lineId = React.useId();
  const line = fitLine(draft, fit);

  const sizeValue =
    draft.size === null
      ? COPY.noneYet
      : COPY.sizeValue(
          sizeWords(draft.size),
          rangeWords(draft.lengthMinMin, draft.lengthMaxMin),
        );
  const daysValue =
    draft.days.length === 0
      ? COPY.noneYet
      : draft.days.map(shortDate).join(", ");

  const sizeField = (
    <SizeField
      size={draft.size}
      min={draft.lengthMinMin}
      max={draft.lengthMaxMin}
      onSize={(size) => change(pickSize(draft, size))}
      onRange={({ min, max }) =>
        change({ ...draft, lengthMinMin: min, lengthMaxMin: max })
      }
    />
  );
  const daysField = (
    <DaysField chips={fit.chips} value={draft.days} onToggle={toggle} />
  );
  const clientRow = (
    <>
      <ValueRow
        label={COPY.fields.client}
        value={clientValue}
        leading={
          // The pool's rows draw the name alone.
          client === null || !full ? null : (
            <ClientTile letter={client.letter} hue={client.hue} />
          )
        }
        chevron={full}
        expanded={picker === "client"}
        onPress={togglePicker("client")}
      />
      {picker === "client" ? (
        <ClientPicker
          clients={clients}
          value={draft.clientId}
          onChange={(clientId) => {
            change({ ...draft, clientId });
            setPicker(null);
          }}
        />
      ) : null}
    </>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title}
      header={header}
      // The × is in the header (or none, as the pool's frame), so no second close.
      headerAction={null}
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "pt-(--space-2)",
        body: "flex flex-col gap-(--space-4) pt-(--space-3)",
        footer: "border-t-0",
      }}
      footer={
        <div className="flex flex-col gap-(--space-3)">
          <Text
            as="p"
            id={lineId}
            variant="secondary"
            tone="muted"
            aria-live="polite"
            data-fit-line=""
          >
            {line}
          </Text>
          {error === null ? null : (
            <Text as="p" variant="secondary" role="alert">
              {error}
            </Text>
          )}
          <Button
            id={actionId}
            size="lg"
            className="w-full"
            aria-describedby={lineId}
            disabled={!canSave(draft, fit) || writes.isPending}
            onClick={() => void save()}
          >
            {actionWords(draft)}
          </Button>
        </div>
      }
    >
      <Input
        label={COPY.fields.title}
        value={draft.title}
        onChange={(event) => change({ ...draft, title: event.target.value })}
        classes={{ label: "font-semibold text-foreground" }}
      />

      {full ? (
        <>
          <div className="border-hairline border-t">{clientRow}</div>
          <TierField
            value={draft.tier}
            onChange={(next) => change({ ...draft, tier: next })}
          />
          {sizeField}
          {daysField}
        </>
      ) : (
        <div className="border-hairline flex flex-col border-t">
          {clientRow}
          <ValueRow
            label={COPY.fields.size}
            value={sizeValue}
            expanded={picker === "size"}
            onPress={togglePicker("size")}
          />
          {picker === "size" ? (
            <div className="py-(--space-3)">{sizeField}</div>
          ) : null}
          <ValueRow
            label={COPY.fields.due}
            value={dueWords(draft.dueOn)}
            expanded={picker === "due"}
            onPress={togglePicker("due")}
          />
          {picker === "due" ? (
            <DateField
              className="py-(--space-3)"
              label={COPY.fields.due}
              value={draft.dueOn}
              onChange={(dueOn) => change({ ...draft, dueOn: dueOn || null })}
            />
          ) : null}
          <ValueRow
            label={COPY.fields.days}
            value={daysValue}
            expanded={picker === "days"}
            onPress={togglePicker("days")}
          />
          {picker === "days" ? (
            <div className="py-(--space-3)">{daysField}</div>
          ) : null}
        </div>
      )}
    </ResponsiveSheet>
  );
}
