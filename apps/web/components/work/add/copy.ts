import type { WorkSize, WorkTier } from "@syn/types";

/**
 * + Add's words (USE-51; add/index.md and its states). Gloss passed the
 * drawn strings; they stay as drawn. "Taylor" is the signed-in person's
 * name, passed in, never "you".
 */
export const ADD_COPY = {
  trigger: "Add",
  title: "Add",
  close: "Close",
  choices: {
    task: {
      label: "Task to a tier",
      line: "New work in Urgent, Primary, Secondary or Stretch",
    },
    pool: {
      label: "From the pool",
      line: (name: string) =>
        `Saved work, and Linear issues assigned to ${name}`,
    },
    todo: {
      label: "To-do",
      line: "A one-off, or a daily reminder with a time",
    },
    event: {
      label: "Event",
      line: "A fixed time; shows where it lands and what moves",
    },
  },
} as const;

export const NEW_TASK_COPY = {
  title: "New task",
  close: "Close",
  /** "Mon 12 · Work · Task to a tier". */
  context: (day: string, block: string) => `${day} · ${block} · Task to a tier`,
  poolContext: "Pool · New task",
  blockLine: (day: string, block: string, from: string, to: string) =>
    `${day} · ${block}, ${from} to ${to}`,
  fields: {
    title: "Title",
    client: "Client and project",
    tier: "Tier",
    size: "Size",
    due: "Due",
    days: "Days",
    range: "Length",
  },
  daysHint: "two days make it two sessions",
  noneYet: "None yet",
  noClient: "No client",
  /** The project half until Linear lands (the clients ticket). */
  noProject: "none",
  clientValue: (client: string, project: string) => `${client} · ${project}`,
  sizeValue: (size: string, range: string) => `${size} · ${range}`,
  editRange: (range: string) => `${range}, change the length`,
  rowName: (label: string, value: string) => `${label}, ${value}`,
  tiers: {
    urgent: "Urgent",
    primary: "Primary",
    secondary: "Secondary",
    stretch: "Stretch",
  } satisfies Record<WorkTier, string>,
  sizes: {
    quick: "1 Quick",
    small: "2 Small",
    medium: "3 Medium",
    large: "5 Large",
    huge: "8 Huge",
  } satisfies Record<WorkSize, string>,
  selectedName: "selected",
  noWorkBlockName: "no Work block",
  pastName: "already past",
  /** "Mon's Primary runs to 11:40 at the top of its ranges". */
  runsToFirst: (day: string, tier: string, at: string) =>
    `${day}'s ${tier} runs to ${at} at the top of its ranges`,
  /** "Wed's to 11:10". */
  runsToNext: (day: string, at: string) => `${day}'s to ${at}`,
  /** As From Linear's line words it: "past Work's end at 12:00". */
  pastEnd: (end: string) => `: past Work's end at ${end}`,
  /** "Sat and Sun have no Work block." */
  noWorkBlock: (days: string) =>
    `${days} ${days.includes(" and ") ? "have" : "has"} no Work block.`,
  /** [ASSUMPTION] Not drawn: no size yet, so no end to name. */
  pickASize: (tier: string) => `Pick a size to see where ${tier} ends.`,
  /** [ASSUMPTION] Not drawn: Huge has no top (the size dev note). */
  noTop: (tier: string) =>
    `8 Huge has no top, so where ${tier} ends isn't known. Bigger than a block. Split it?`,
  poolLine:
    "With no days it waits in the pool. It isn't sent to Linear; Synapse-only work stays here.",
  addTo: (tier: string, days: string) => `Add to ${tier}, ${days}`,
  saveToPool: "Save to the pool",
  addedTo: (tier: string, days: string) => `Added to ${tier}, ${days}`,
  savedToPool: "Saved to the pool",
  notSaved: "Not added. Try again.",
} as const;
