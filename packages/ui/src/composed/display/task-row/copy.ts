/**
 * TaskRow's default words — Workflow UX v0.1 §7 (*Row words*, *Toggle
 * (accessible)*), verbatim. Callers may override any of them through `copy`.
 *
 * The spoken forms are for the row's accessible name: durations in full words
 * (WF-01 accessibility — *back 2 minutes*), never the short visual form.
 */
export const WORKFLOW_ROW_COPY = {
  next: "next",
  firing: "firing",
  back: "back",
  /** The lane *No group*, named in a row's accessible name (§7, *Lane*). */
  noGroup: "No group",
  fire: (title: string) => `Fire ${title}`,
  markBack: (title: string) => `Mark ${title} back`,
  /** "1 minute", "59 minutes", "1 hour", "1 hour 12 minutes". */
  spokenMinutes: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
    if (hours === 0) return unit(rest, "minute");
    if (rest === 0) return unit(hours, "hour");
    return `${unit(hours, "hour")} ${unit(rest, "minute")}`;
  },
} as const;

export type WorkflowRowCopy = typeof WORKFLOW_ROW_COPY;
