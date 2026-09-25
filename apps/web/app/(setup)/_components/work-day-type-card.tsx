"use client";

import * as React from "react";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardSummary,
  CardTitle,
  ChipPicker,
  EmojiSlot,
  EmojiSlotButton,
  HelperText,
  Input,
  LargeTargetRow,
  Text,
  TimeField,
} from "@syn/ui";
import { TEMPLATE_NAME_MAX, WORK_DAY_KINDS } from "@syn/constants";
import type { AnchorDirection, IconValue, TemplateSummaryView, WorkDayKind } from "@syn/types";
import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * WorkDayTypeCard — one kind of work day (UX v1.2 §4.3, §4.16; TD-14; RUN-8).
 *
 * A `Card` with the kind chips first — *Remote · Coworking · Office or site ·
 * Other* — which fill the name and the emoji when the person has not typed
 * one (*Other* fills neither); then *Working by*, *Until about*, the *what
 * gives* radio, and **Done**. Done writes the work template — `create` for
 * a card the screen appended, `update` for one that exists — and collapses
 * the card in place to two lines (v1.3 R57): *Remote* · *Edit*, then
 * *9:00–17:30 · work waits*.
 *
 * A `template` prop going from null to the saved row on the same instance is
 * the create landing (DAY-2): the list keeps this card, and the next Done is
 * an `update`.
 *
 * SAVE AS YOU GO, PER CARD. The card is the unit: a type is not a fact
 * until its anchor and its answer are together, so Done is the write and
 * *Continue* on the screen only navigates. A card left open is a card not
 * yet a type; the screen's primary waits for it.
 *
 * THE SUMMARY IS THE CARD'S OWN VALUES, never a re-read: what the person
 * just entered is what the line says, and the list refetches beneath.
 *
 * NOTHING PRESELECTED but the card's own facts: the kind chips open on
 * none; the *what gives* rows open on none; 9:00 and 17:30 are the placeholder
 * answers the *Yes* path also offers.
 */

export interface WorkDayTypeDraft {
  kind: WorkDayKind | null;
  name: string;
  icon: IconValue | null;
  /** "HH:mm" */
  workStart: string;
  workEnd: string;
  direction: AnchorDirection | null;
}

/** What a card needs of its row — a `TemplateSummaryView` is one, and so is what Done hands back. */
export type WorkDayTypeSeed = Pick<TemplateSummaryView, "id" | "name" | "workDayType">;

const KIND_OPTIONS = WORK_DAY_KINDS.map((entry) => ({
  value: entry.key,
  label: entry.title,
  icon: entry.icon as IconValue,
}));

/** "09:00" from the view's "9:00" / "9:00 AM". */
function toInputClock(clock: string | null, fallback: string): string {
  if (clock === null) return fallback;
  const pm = /PM$/i.test(clock);
  const [hour = "0", minute = "00"] = clock.replace(/\s?[AP]M$/i, "").split(":");
  let h = Number(hour);
  if (pm && h < 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

/** "9:00" as the summary line reads it. */
const display = (clock: string): string => formatClockFromMinutes(clockToMinutes(clock));

export function draftFromTemplate(template: WorkDayTypeSeed | null): WorkDayTypeDraft {
  const type = template?.workDayType ?? null;
  return {
    kind: type?.locationKind ?? null,
    name: template?.name ?? "",
    icon: type?.icon ?? null,
    workStart: toInputClock(type?.startClock ?? null, "09:00"),
    workEnd: toInputClock(type?.endClock ?? null, "17:30"),
    direction: type?.anchorDirection ?? null,
  };
}

export function WorkDayTypeCard({
  template,
  initiallyOpen,
  onSaved,
  onRemoved,
  onDiscard,
}: {
  /** Null for a card the screen appended and has not written yet. */
  template: WorkDayTypeSeed | null;
  initiallyOpen: boolean;
  /** The row as the card knows it — its id and the values just written. */
  onSaved: (saved: WorkDayTypeSeed) => void;
  /** Absent while the card has no row. */
  onRemoved?: () => void;
  /** An appended card, closed before Done — the screen drops it. */
  onDiscard?: () => void;
}) {
  const online = useOnline();
  const create = trpc.template.create.useMutation();
  const update = trpc.template.update.useMutation();
  const archive = trpc.template.archive.useMutation();
  const [open, setOpen] = React.useState(initiallyOpen);
  const [draft, setDraft] = React.useState<WorkDayTypeDraft>(() => draftFromTemplate(template));
  const [nameTouched, setNameTouched] = React.useState(template !== null && template.name !== "");
  const [iconTouched, setIconTouched] = React.useState(template?.workDayType?.icon != null);
  const [error, setError] = React.useState<string | null>(null);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const groupId = React.useId();

  const caption = COPY.typeCaption(
    display(draft.workStart),
    display(draft.workEnd),
    draft.direction === null ? null : COPY.givesShort[draft.direction],
  );

  const pickKind = (value: string | null) => {
    const kind = value as WorkDayKind | null;
    const entry = WORK_DAY_KINDS.find((candidate) => candidate.key === kind);
    setDraft((current) => ({
      ...current,
      kind,
      // The kind fills what the person has not written; *Other* fills neither.
      name: !nameTouched && entry && entry.key !== "other" ? entry.title : current.name,
      icon: !iconTouched && entry && entry.key !== "other" ? entry.icon : current.icon,
    }));
  };

  const complete = draft.name.trim() !== "" && draft.direction !== null;

  async function done(): Promise<void> {
    if (!complete || draft.direction === null) return;
    setError(null);
    const fields = {
      anchorTime: draft.workStart,
      workEndTime: draft.workEnd,
      locationKind: draft.kind,
      anchorDirection: draft.direction,
      icon: draft.icon,
    };
    try {
      const row =
        template === null
          ? await create.mutateAsync({ kind: "work", name: draft.name.trim(), workDayType: fields })
          : await update.mutateAsync({ id: template.id, patch: { name: draft.name.trim(), ...fields } });
      setOpen(false);
      onSaved({
        id: row.id,
        name: draft.name.trim(),
        workDayType: {
          startClock: display(draft.workStart),
          endClock: display(draft.workEnd),
          locationKind: draft.kind,
          anchorDirection: draft.direction,
          icon: draft.icon,
        },
      });
      // Focus lands on the collapsed summary's *Edit* (§4.3's accessibility line).
      window.setTimeout(() => editRef.current?.focus(), 0);
    } catch {
      setError(COPY.typeSaveError);
    }
  }

  async function remove(): Promise<void> {
    if (template === null) {
      onDiscard?.();
      return;
    }
    try {
      await archive.mutateAsync({ id: template.id });
      onRemoved?.();
    } catch {
      setError(COPY.saveError);
    }
  }

  const busy = create.isPending || update.isPending;

  if (!open) {
    // Two lines, in place (v1.3 R57, R58): glyph · name · *Edit*, then the hours and what gives.
    return (
      <Card className="py-(--space-2)">
        <CardSummary
          leading={<EmojiSlot icon={draft.icon} size="card" />}
          title={draft.name.trim() || COPY.aWorkDayType}
          caption={caption}
          action={
            <Button ref={editRef} variant="ghost" size="sm" onClick={() => setOpen(true)}>
              {COPY.edit}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card role="group" aria-labelledby={groupId}>
      <CardHeader>
        <CardTitle id={groupId} className="text-(length:--fs-body)">
          {draft.name.trim() || COPY.aWorkDayType}
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => void remove()}>
            {COPY.remove}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChipPicker label={COPY.kind} options={KIND_OPTIONS} value={draft.kind} onChange={pickKind} />

        <div className="flex items-end gap-(--space-2)">
          <EmojiSlotButton
            icon={draft.icon}
            label={COPY.chooseAnIcon}
            onChange={(icon) => {
              setIconTouched(true);
              setDraft((current) => ({ ...current, icon }));
            }}
            className="mb-px"
          />
          <Input
            label={COPY.typeName}
            placeholder={COPY.typeNamePlaceholder}
            value={draft.name}
            maxLength={TEMPLATE_NAME_MAX}
            onChange={(event) => {
              setNameTouched(event.target.value !== "");
              setDraft((current) => ({ ...current, name: event.target.value }));
            }}
            className="flex-1"
          />
        </div>

        <TimeField
          label={COPY.workingBy}
          value={draft.workStart}
          onChange={(value) => setDraft((current) => ({ ...current, workStart: value }))}
          disclosed
          changeLabel={COPY.change}
          doneLabel={COPY.done}
          required
        />
        <TimeField
          label={COPY.untilAbout}
          value={draft.workEnd}
          onChange={(value) => setDraft((current) => ({ ...current, workEnd: value }))}
          disclosed
          changeLabel={COPY.change}
          doneLabel={COPY.done}
          required
        />

        <div className="flex flex-col gap-(--space-3)">
          <Text as="h3" variant="body" weight={500}>
            {COPY.whatGives}
          </Text>
          <LargeTargetRow
            layout="stacked"
            label={COPY.whatGives}
            value={draft.direction}
            onChange={(value) => setDraft((current) => ({ ...current, direction: value as AnchorDirection }))}
            options={[
              { value: "work_waits", label: COPY.gives.work_waits, description: COPY.gives.work_waitsBody },
              { value: "routine_cut", label: COPY.gives.routine_cut, description: COPY.gives.routine_cutBody },
              { value: "depends", label: COPY.gives.depends, description: COPY.gives.dependsBody },
            ]}
            className="[&>span:first-child]:sr-only"
          />
        </div>

        {error ? <HelperText error>{error}</HelperText> : null}

        <div className="flex justify-end">
          <Button busy={busy} disabled={!online || !complete} onClick={() => void done()}>
            {COPY.done}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** A type's *Working by* as "HH:mm", for the screens that read the first type. */
export function typeStartClock(template: TemplateSummaryView | null | undefined): string | null {
  const start = template?.workDayType?.startClock ?? null;
  return start === null ? null : clockFromMinutes(clockToMinutes(toInputClock(start, "09:00")));
}
