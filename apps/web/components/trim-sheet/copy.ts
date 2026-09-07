/**
 * TR-01's strings — Epic 2 §7, official spec §5.8.
 *
 * NOTHING TRIMMED IS EVER CALLED MISSED, HERE OR ANYWHERE. *Not assigned
 * today* is the phrase, and it is the same phrase LS-02 uses on the List, so a
 * person meets the idea once and recognises it later. The product's second
 * guardrail (§2.4) is that it does not score what someone never agreed to do,
 * and the vocabulary is where that promise is either kept or quietly broken.
 *
 * *Nothing else is flexible.* IS A FACT, NOT A REFUSAL. The day genuinely has
 * nothing left to give — the rest is appointments and things already done — and
 * saying so plainly is more useful than disabling the button and leaving
 * someone to work out why.
 */
export const TRIM_COPY = {
  title: "I have less time today",

  timeAvailable: "Time available",
  minutesUnit: "min",
  /** "Planned: 295 min (7:00–9:20)" */
  planned: (minutes: number, window: string) =>
    `Planned: ${minutes} min (${window})`,
  plannedNoTimes: (minutes: number) => `Planned: ${minutes} min`,

  chipsLabel: "Take time off",
  chip: (minutes: number) => `−${minutes}`,

  wholePlan: "That's the whole plan — nothing to trim.",
  fitsIn: (capacity: number) => `Fits in ${capacity} min.`,
  notAssignedToday: "Not assigned today:",
  keepInstead: "Keep instead",
  /** §6.8 — everything flexible is already set aside. */
  nothingElseFlexible: (over: number) =>
    `Nothing else is flexible. ${over} min over.`,
  keptOver: (over: number) => `Kept — ${over} min over.`,
  comeBack: (count: number) =>
    `${count} ${count === 1 ? "comes" : "come"} back.`,
  /** "45 min · priority 3" */
  rowMeta: (minutes: number, priority: number) =>
    `${minutes} min · priority ${priority}`,

  cancel: "Cancel",
  apply: "Apply",
  /** [COPY — needs Vesper sign-off; TR-01 lists no error string.] */
  applyError: "Couldn't save. Try again.",
} as const;
