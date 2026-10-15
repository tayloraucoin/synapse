import type { WorkTier } from "@syn/types";
import type { SquareHue } from "@syn/ui";

/**
 * The work parts' view models (USE-10): plain fields, every word already
 * printed. A screen's hook builds these from its records; a part never takes
 * a record, a hook or the clock.
 */

export type WorkRowForm = "idle" | "next" | "firing" | "done";

export type PriorityLevel = "urgent" | "high" | "normal" | "low";

/** Client.color_key (D-USE-95). */
export type ClientHue = "rose" | "leaf" | "amber" | "moss" | "slate" | "ink";

export interface WorkRowView {
  id: string;
  title: string;
  emoji: string | null;
  form: WorkRowForm;
  /** The client's letter tile; its name shows at the desk only (D-USE-51). */
  client: { letter: string; name: string; hue: ClientHue } | null;
  /** The project's emoji; its name shows at the desk only. */
  project: { emoji: string | null; name: string } | null;
  /** The Linear ID, "KES-42". */
  identifier: string | null;
  /** "No Linear", in the ID's place on a Synapse-only item. */
  noLinear: string | null;
  /** "High", with its glyph (D-USE-42). */
  priority: { level: PriorityLevel; word: string } | null;
  /** "3 Medium". */
  size: string | null;
  /** Linear's labels, in Linear's colours; the desk only. */
  labels: { name: string; color: string }[];
  /** "session 1 of 3". */
  session: string | null;
  /** "worked 40 min", kept while firing (D-USE-47). */
  worked: string | null;
  /** "fired 12 min", once back (D-USE-47; USE-59). */
  fired?: string | null;
  /** The right column at rest: "30 to 60 min". */
  length: string | null;
  /** The firing form's words: "firing" and "4 min" (D-USE-49). */
  firing: { word: string; time: string } | null;
  /** The done form's record: "Took 1 h 10 · fired 32 min" (D-USE-48). */
  doneRecord: string | null;
  /**
   * The lifted card's consequence of a meeting ahead (USE-62; D-USE-77):
   * its planned length and "would end 10:50, past [Design sync]", in ink,
   * never a warning colour.
   */
  consequence?: { length: string; words: string } | null;
  /** Sub-issues: checkboxes at the desk, folded on the phone (D-USE-51). */
  subIssues: {
    summary: string;
    items: { id: string; title: string; done: boolean }[];
  } | null;
}

export interface WorkRowHandlers {
  /** The ring fires; the firing mark brings back. `next` is the wanted state. */
  onToggleFiring?: (id: string, next: boolean) => void;
  /** Opens the Item sheet. */
  onOpen?: (id: string) => void;
  onToggleSubIssue?: (rowId: string, subIssueId: string, done: boolean) => void;
}

/** The tiers' squares step red, leaf, amber, slate (D-USE-38). */
export const TIER_HUE: Record<WorkTier, SquareHue> = {
  urgent: "alert",
  primary: "leaf",
  secondary: "amber",
  stretch: "slate",
};

/** One line of a week-strip card: a work item or an event (USE-58). */
export type StripLine =
  | {
      kind: "work";
      id: string;
      tier: WorkTier;
      /** "[Case studies]". */
      title: string;
      /** "2/3": the session's place, never a count of the day (D-USE-47). */
      session: string | null;
    }
  | { kind: "event"; id: string; time: string; title: string };

/** A day card on the desk's week strip (USE-58; D-USE-55). */
export interface StripDayView {
  dateKey: string;
  /** "Mon 12". */
  head: string;
  /** "Monday 12 October": the card's name with its lines. */
  name: string;
  isToday: boolean;
  past: boolean;
  /** Up to two. */
  lines: StripLine[];
  /** With no lines: "Nothing slotted yet", "No work", "Sunday reset". */
  empty: string | null;
}
