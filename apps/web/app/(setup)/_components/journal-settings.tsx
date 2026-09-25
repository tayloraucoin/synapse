"use client";

import * as React from "react";

import {
  DEFAULT_JOURNAL_PROMPTS,
  JOURNAL_PROMPTS_MAX,
  JOURNAL_PROMPT_MAX,
  JOURNAL_REMINDER_OFFSET_MIN,
  PLACED_ROW_ICONS,
} from "@syn/constants";
import type { JournalPrompt } from "@syn/types";
import {
  Button,
  EllipsesMenu,
  Input,
  SortableHandle,
  SortableList,
  StatusLine,
  Switch,
  Text,
  TimeField,
} from "@syn/ui";
import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * The journal's settings — the switch, the prompts, the reminder (UX v1.2
 * §4.11, R38; v1.3 §4.4 B12). Lifted out of screen 11 unchanged by DAY-10 so
 * the day builder's B12 (on the first plan only) and Settings → Closing the
 * day mount one component.
 *
 * Every control writes at once. THE PROMPTS ARE THE PERSON'S, sortable by
 * handle, the menu keeping *Move up / Move down* as the keyboard path; a
 * rename keeps the key so its answers survive. THE REMINDER is one push at a
 * time the person set, in their words — the caption reads them back; it
 * follows phone away until set, and hides with the journal.
 */
export function JournalSettings({
  initialJournalEnabled,
  initialPrompts,
  initialReminderTime,
  initialReminderEnabled,
  phoneAway,
  disabled,
}: {
  initialJournalEnabled: boolean;
  initialPrompts: JournalPrompt[];
  /** The stored value; null = following phone away. */
  initialReminderTime: string | null;
  initialReminderEnabled: boolean;
  /** "HH:mm" — the phone-away time the reminder follows until it is set. */
  phoneAway: string;
  disabled: boolean;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const setPref = trpc.notification.setPref.useMutation();
  const utils = trpc.useUtils();

  const [journal, setJournal] = React.useState(initialJournalEnabled);
  const [prompts, setPrompts] = React.useState<JournalPrompt[]>(
    initialPrompts.length > 0 ? initialPrompts : DEFAULT_JOURNAL_PROMPTS.map((prompt) => ({ ...prompt })),
  );
  const [reminderTime, setReminderTime] = React.useState<string | null>(initialReminderTime);
  const [reminderOn, setReminderOn] = React.useState(initialReminderEnabled);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [line, setLine] = React.useState<string | null>(null);
  const journalId = React.useId();
  const reminderId = React.useId();

  const reminderEffective = reminderTime ?? clockFromMinutes(clockToMinutes(phoneAway) - JOURNAL_REMINDER_OFFSET_MIN);

  async function write(patch: Parameters<typeof save.mutateAsync>[0]): Promise<void> {
    setLine(null);
    try {
      await save.mutateAsync(patch);
      await utils.user.me.invalidate();
    } catch {
      setLine(COPY.saveError);
    }
  }

  const writePrompts = (next: JournalPrompt[]) => {
    setPrompts(next);
    void write({ journalPrompts: next });
  };

  function move(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= prompts.length) return;
    const next = [...prompts];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(target, 0, moved);
    writePrompts(next);
  }

  function rename(key: string, label: string): void {
    const trimmed = label.trim();
    if (trimmed === "") return;
    writePrompts(prompts.map((prompt) => (prompt.key === key ? { ...prompt, label: trimmed } : prompt)));
    setEditing(null);
  }

  function add(label: string): void {
    const trimmed = label.trim();
    if (trimmed === "" || prompts.length >= JOURNAL_PROMPTS_MAX) return;
    writePrompts([...prompts, { key: keyFor(trimmed, prompts), label: trimmed }]);
    setDraft("");
    setAdding(false);
  }

  const reminderCaption = COPY.reminderCaption(formatClockFromMinutes(clockToMinutes(reminderEffective)));

  return (
    <section className="flex flex-col gap-(--space-3)">
      <div className="flex items-start justify-between gap-(--space-4)">
        <span className="flex min-w-0 items-start gap-(--space-2)">
          <span aria-hidden="true" className="font-emoji inline-flex size-(--target) shrink-0 items-center justify-center text-[1.25rem] leading-none">
            {PLACED_ROW_ICONS.journal.value}
          </span>
          <span className="flex min-w-0 flex-col gap-(--space-1) pt-(--space-2)">
            <Text as="label" htmlFor={journalId} variant="body" weight={500}>
              {COPY.fewLines}
            </Text>
          </span>
        </span>
        <Switch
          id={journalId}
          checked={journal}
          disabled={disabled}
          onCheckedChange={(next) => {
            setJournal(next);
            void write({ journalEnabled: next });
          }}
        />
      </div>

      {journal ? (
        <>
          <SortableList
            label={COPY.promptsLabel}
            items={prompts.map((prompt) => ({ id: prompt.key, title: prompt.label, prompt }))}
            disabled={disabled}
            onReorder={(keys) => {
              const byKey = new Map(prompts.map((prompt) => [prompt.key, prompt]));
              writePrompts(keys.map((key) => byKey.get(key)).filter((prompt): prompt is JournalPrompt => prompt !== undefined));
            }}
            renderItem={(item, { handleProps }) => {
              const prompt = item.prompt;
              const index = prompts.findIndex((row) => row.key === prompt.key);
              return (
                <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
                  <SortableHandle {...handleProps} />
                  {editing === prompt.key ? (
                    <form
                      className="flex min-w-0 flex-1 items-end gap-(--space-2)"
                      onSubmit={(event) => {
                        event.preventDefault();
                        rename(prompt.key, draft);
                      }}
                    >
                      <Input
                        label={COPY.promptLabel}
                        value={draft}
                        maxLength={JOURNAL_PROMPT_MAX}
                        autoFocus
                        onChange={(event) => setDraft(event.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                        {COPY.done}
                      </Button>
                    </form>
                  ) : (
                    <Text as="span" variant="body" truncate className="min-w-0 flex-1" title={prompt.label}>
                      {prompt.label}
                    </Text>
                  )}
                  <EllipsesMenu
                    label={prompt.label}
                    disabled={disabled}
                    items={[
                      {
                        label: COPY.edit,
                        onClick: () => {
                          setDraft(prompt.label);
                          setEditing(prompt.key);
                        },
                      },
                      { label: COPY.moveUp, onClick: () => move(index, -1), disabled: index === 0 },
                      { label: COPY.moveDown, onClick: () => move(index, 1), disabled: index === prompts.length - 1 },
                      {
                        label: COPY.remove,
                        onClick: () => writePrompts(prompts.filter((row) => row.key !== prompt.key)),
                      },
                    ]}
                  />
                </div>
              );
            }}
          />

          {adding ? (
            <form
              className="flex items-end gap-(--space-2)"
              onSubmit={(event) => {
                event.preventDefault();
                add(draft);
              }}
            >
              <Input
                label={COPY.promptLabel}
                value={draft}
                maxLength={JOURNAL_PROMPT_MAX}
                autoFocus
                onChange={(event) => setDraft(event.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                {COPY.add}
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              className="self-start"
              disabled={prompts.length >= JOURNAL_PROMPTS_MAX || disabled}
              onClick={() => {
                setDraft("");
                setEditing(null);
                setAdding(true);
              }}
            >
              {COPY.addAPrompt}
            </Button>
          )}

          <Text as="p" variant="caption" tone="secondary">
            {COPY.fewLinesBody}
          </Text>

          <div className="flex flex-col gap-(--space-1)">
            <div className="flex items-end gap-(--space-3)">
              <div className="min-w-0 flex-1">
                <TimeField
                  label={COPY.aReminder}
                  value={reminderEffective}
                  onChange={(next) => {
                    setReminderTime(next);
                    void write({ journalReminderTime: next });
                  }}
                  disclosed
                  changeLabel={COPY.change}
                  doneLabel={COPY.done}
                  disabled={disabled}
                  required
                />
              </div>
              <span className="flex items-center gap-(--space-2) pb-(--space-2)">
                <Text as="label" htmlFor={reminderId} variant="caption" tone="secondary">
                  {COPY.remindMe}
                </Text>
                <Switch
                  id={reminderId}
                  checked={reminderOn}
                  disabled={disabled}
                  aria-describedby={`${reminderId}-caption`}
                  onCheckedChange={(next) => {
                    setReminderOn(next);
                    void write({ journalReminderEnabled: next });
                    void setPref.mutateAsync({ kind: "journal_reminder", enabled: next }).then(() =>
                      utils.notification.prefs.invalidate(),
                    );
                  }}
                />
              </span>
            </div>
            <Text as="p" id={`${reminderId}-caption`} variant="caption" tone="secondary">
              {reminderCaption}
            </Text>
          </div>
        </>
      ) : null}

      {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}
    </section>
  );
}

/** A stable key from the words — `journalPromptKeySchema`'s shape, unique in the set. */
function keyFor(label: string, existing: readonly JournalPrompt[]): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/^[0-9]/, "p$&")
      .slice(0, 50) || "prompt";
  let key = base;
  let n = 2;
  while (existing.some((prompt) => prompt.key === key)) {
    key = `${base}_${n}`;
    n += 1;
  }
  return key;
}
