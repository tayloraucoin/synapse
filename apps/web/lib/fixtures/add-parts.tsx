"use client";

import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "@/app/(shell)/_components/tab-header";
import { AddEntry, NewTaskSheet } from "@/components/work/add";
import { ADD_IDS } from "./scenarios/add";
import { SET_UP_IDS } from "./scenarios/set-up";

/**
 * USE-51's states on `/dev/parts?state=<name>`, named as their scenarios,
 * until Now's and Today's headers mount + Add (their tickets): the Add sheet
 * (below the desk) or the + Add menu (at it) open on load, New task with
 * Mon and Wed picked, and the pool's New task with no days.
 */

export type AddPartState =
  "add-sheet" | "add-menu" | "add-new-task" | "add-save-to-the-pool";

const COPY = {
  now: "Now",
  pool: "Pool",
  line: "The screen beneath is drawn by its own ticket.",
};

const MONDAY = "2026-10-12";
const WORK = {
  id: SET_UP_IDS.blocks.work,
  name: "Work",
  startsAt: "09:30",
  endsAt: "12:00",
};

export function AddPart({ state }: { state: AddPartState }) {
  if (state === "add-save-to-the-pool") {
    return (
      <>
        <TabHeader title={COPY.pool} />
        <ScreenFrame>
          <Text as="p" variant="body" tone="muted">
            {COPY.line}
          </Text>
        </ScreenFrame>
        <NewTaskSheet
          open
          onOpenChange={() => {}}
          dateKey={MONDAY}
          from="pool"
          initial={{
            title: "[Kestrel: quarterly report deck]",
            clientId: ADD_IDS.clients.kestrel,
            size: "large",
            lengthMinMin: 120,
            lengthMaxMin: 240,
            dueOn: "2026-10-16",
          }}
        />
      </>
    );
  }

  return (
    <>
      <TabHeader title={COPY.now} />
      <ScreenFrame>
        <div className="flex items-center justify-between gap-(--space-3)">
          <Text as="p" variant="body" tone="muted">
            {COPY.line}
          </Text>
          <AddEntry
            dateKey={MONDAY}
            block={WORK}
            openOnLoad={state === "add-new-task" ? "new-task" : "add"}
            initialTask={
              state === "add-new-task"
                ? {
                    title: "[Pricing page: tighten the copy]",
                    clientId: ADD_IDS.clients.alder,
                    tier: "primary",
                    size: "medium",
                    lengthMinMin: 60,
                    lengthMaxMin: 120,
                    days: ["2026-10-12", "2026-10-14"],
                  }
                : undefined
            }
          />
        </div>
      </ScreenFrame>
    </>
  );
}
