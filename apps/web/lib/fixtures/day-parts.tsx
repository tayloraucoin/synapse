"use client";

import * as React from "react";
import type { WorkSize } from "@syn/types";
import { ScreenFrame, Text } from "@syn/ui";
import {
  DayBlockBand,
  DayBlockHeader,
  PlannerItemRow,
  type PlannerItemRowView,
} from "@/components/planner";
import {
  TierGroup,
  WhileItFiresLine,
  WorkRow,
  type ClientHue,
  type WorkRowView,
} from "@/components/work";
import { BASE_IDS, baseRecords } from "./scenarios/base-day";

/**
 * USE-10's parts on `/dev/parts`, each form side by side, with props built
 * from the default scenario's records. What the records do not hold yet
 * (Linear's project, priority and labels; the printed lengths) is filled
 * here, the way a screen's hook will. The rings and boxes work locally, so
 * a capture can show a form changing.
 */

const records = baseRecords();
const W = BASE_IDS.workItems;

/** Linear's estimate points, as the size chip prints them ("3 Medium"). */
const SIZE_POINTS: Record<WorkSize, number> = {
  quick: 1,
  small: 2,
  medium: 3,
  large: 5,
  huge: 8,
};
const SIZE_WORD: Record<WorkSize, string> = {
  quick: "Quick",
  small: "Small",
  medium: "Medium",
  large: "Large",
  huge: "Huge",
};

/** The Linear side of each item: not in the records until the integration. */
const LINEAR: Record<string, Partial<WorkRowView>> = {
  [W.urgent]: {
    emoji: "🔐",
    project: { emoji: "🏥", name: "Patient portal" },
    priority: { level: "urgent", word: "Urgent" },
  },
  [W.primary]: {
    emoji: "🔐",
    project: { emoji: "🏥", name: "Patient portal" },
    priority: { level: "urgent", word: "Urgent" },
    labels: [{ name: "API", color: "#4CB7A5" }],
  },
  [W.secondary]: {
    emoji: "🧾",
    project: { emoji: "📊", name: "Billing" },
    priority: { level: "high", word: "High" },
    labels: [{ name: "Copy", color: "#C38FD6" }],
    session: "session 1 of 3",
  },
  [W.stretch]: {
    emoji: "🗂️",
    project: { emoji: "🗄️", name: "Admin" },
    priority: { level: "low", word: "Low" },
  },
};

const HUE_OF: Record<string, ClientHue> = { rose: "rose", leaf: "leaf" };

function workRow(id: string, overrides: Partial<WorkRowView>): WorkRowView {
  const item = records.workItems.find((w) => w.id === id);
  if (!item) throw new Error(`No work item ${id} in the base day.`);
  const client = records.clients.find((c) => c.id === item.clientId) ?? null;
  return {
    id,
    title: item.title,
    emoji: null,
    form: "idle",
    client: client
      ? {
          letter: client.name.slice(0, 1),
          name: client.name,
          hue: HUE_OF[client.colorKey] ?? "ink",
        }
      : null,
    project: null,
    identifier: item.linearIdentifier,
    noLinear: item.linearIdentifier ? null : "No Linear",
    priority: null,
    size: item.size
      ? `${SIZE_POINTS[item.size]} ${SIZE_WORD[item.size]}`
      : null,
    labels: [],
    session: null,
    worked: null,
    length: null,
    firing: null,
    doneRecord: null,
    subIssues: null,
    ...LINEAR[id],
    ...overrides,
  };
}

const FORMS: WorkRowView[] = [
  workRow(W.stretch, { form: "idle", length: "15 to 30 min" }),
  workRow(W.secondary, {
    form: "next",
    length: "30 to 60 min",
    subIssues: {
      summary: "2 sub-issues · 1 done",
      items: [
        { id: "sub-1", title: "Header row and totals", done: true },
        { id: "sub-2", title: "CSV column order", done: false },
      ],
    },
  }),
  workRow(W.primary, {
    form: "firing",
    length: "1 to 2 h",
    worked: "worked 35 min",
    firing: { word: "firing", time: "4 min" },
  }),
  workRow(W.urgent, {
    form: "done",
    doneRecord: "Took 1 h 10 · fired 32 min",
  }),
];

function useRows(initial: WorkRowView[]) {
  const [rows, setRows] = React.useState(initial);
  const onToggleFiring = (id: string, next: boolean) =>
    setRows((all) =>
      all.map((row) =>
        row.id !== id
          ? row
          : next
            ? {
                ...row,
                form: "firing",
                firing: { word: "firing", time: "0 min" },
              }
            : { ...row, form: "idle", firing: null },
      ),
    );
  const onToggleSubIssue = (rowId: string, subId: string, done: boolean) =>
    setRows((all) =>
      all.map((row) =>
        row.id !== rowId || !row.subIssues
          ? row
          : {
              ...row,
              subIssues: {
                ...row.subIssues,
                items: row.subIssues.items.map((sub) =>
                  sub.id === subId ? { ...sub, done } : sub,
                ),
              },
            },
      ),
    );
  return { rows, onToggleFiring, onToggleSubIssue };
}

function Caption({ children }: { children: string }) {
  return (
    <Text as="p" variant="caption" tone="muted" className="pt-(--space-4)">
      {children}
    </Text>
  );
}

/** `work-row`: idle, Next, firing and done, one under the other. */
export function WorkRowForms() {
  const { rows, onToggleFiring, onToggleSubIssue } = useRows(FORMS);
  return (
    <ScreenFrame className="flex flex-col">
      {rows.map((row, i) => (
        <React.Fragment key={row.id}>
          <Caption>{FORMS[i]?.form ?? row.form}</Caption>
          <WorkRow
            row={row}
            onToggleFiring={onToggleFiring}
            onToggleSubIssue={onToggleSubIssue}
          />
        </React.Fragment>
      ))}
    </ScreenFrame>
  );
}

const TODOS: PlannerItemRowView[] = [
  {
    id: BASE_IDS.todos.call,
    title: "Call the dentist",
    emoji: "📞",
    checked: false,
    meta: "Call",
  },
  {
    id: BASE_IDS.todos.reminder,
    title: "Drink water",
    emoji: "💧",
    checked: true,
    meta: "daily · 10:00",
  },
  {
    id: BASE_IDS.todos.errand,
    title: "Pick up the dry cleaning",
    emoji: "👔",
    checked: false,
    meta: "today · 14:00",
  },
];

/** `tier-and-item`: the tiers (Urgent empty, so hidden), the reminder line, the item rows. */
export function TierAndItemForms() {
  const { rows, onToggleFiring, onToggleSubIssue } = useRows(FORMS.slice(0, 3));
  const [todos, setTodos] = React.useState(TODOS);
  const [reminderDone, setReminderDone] = React.useState(false);
  const firstFiring = rows.find((row) => row.form === "firing");
  const byId = (id: string) => rows.filter((row) => row.id === id);
  const handlers = { onToggleFiring, onToggleSubIssue };

  return (
    <ScreenFrame className="flex flex-col">
      <TierGroup tier="urgent" word="Urgent" rows={[]} {...handlers} />
      <TierGroup
        tier="primary"
        word="Primary"
        rows={byId(W.primary)}
        afterRow={
          firstFiring
            ? {
                rowId: firstFiring.id,
                content: (
                  <WhileItFiresLine
                    lead="While it fires:"
                    title="Drink water"
                    meta="daily"
                    checked={reminderDone}
                    onCheckedChange={setReminderDone}
                  />
                ),
              }
            : null
        }
        {...handlers}
      />
      <TierGroup
        tier="secondary"
        word="Secondary"
        rows={byId(W.secondary)}
        {...handlers}
      />
      <TierGroup
        tier="stretch"
        word="Stretch"
        rows={byId(W.stretch)}
        {...handlers}
      />
      <Caption>To-dos</Caption>
      {todos.map((todo) => (
        <PlannerItemRow
          key={todo.id}
          item={todo}
          onCheckedChange={(id, checked) =>
            setTodos((all) =>
              all.map((t) => (t.id === id ? { ...t, checked } : t)),
            )
          }
        />
      ))}
    </ScreenFrame>
  );
}

/** `block-band-and-header`: the desk's band, the phone's header, with and without Step away. */
export function BlockBandAndHeaderForms() {
  const work = records.blocks.find(
    (block) => block.id === BASE_IDS.blocks.work,
  );
  if (!work) throw new Error("No Work block in the base day.");
  const detail = "9:00 to 12:00 · Kestrel weekly at 11:00";
  const menu = {
    label: `${work.name} block, more`,
    items: [{ label: "Edit block" }, { label: "Open the day" }],
  };
  return (
    <ScreenFrame className="flex flex-col gap-(--space-2)">
      <Caption>Band, at the desk</Caption>
      <DayBlockBand
        kind={work.kind}
        name={work.name}
        detail={`${detail}, in 40 min`}
      />
      <Caption>Header, on the phone</Caption>
      <DayBlockHeader
        kind={work.kind}
        name={work.name}
        detail={detail}
        menu={menu}
      />
      <Caption>Header, a timer running</Caption>
      <DayBlockHeader
        kind={work.kind}
        name={work.name}
        detail={detail}
        menu={menu}
        stepAway={{ label: "Step away", onPress: () => undefined }}
      />
    </ScreenFrame>
  );
}
