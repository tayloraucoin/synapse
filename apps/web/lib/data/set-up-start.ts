/** Where Set my days opens and what its frame holds (USE-39). */
export interface SetUpScenarioStart {
  /** The week it opens on when the URL names none. */
  week?: "usual" | "this";
  /** A day open, Monday 0; unset, the week. */
  day?: number;
  /** The + menu, the day's ···, or Clear's ask open on load (USE-42). */
  menu?: "plus" | "day" | "clear";
  /** A usual change to this block, made in its Block view, arriving on load (USE-42). */
  reach?: string;
  /** The block just moved by a drag: its ink edge (overlap.md). */
  moved?: string;
  /** A repeating block dragged to this start on a date: the scope question open (USE-47). */
  askScope?: { block: string; startsAt: string };
  /** The day's Toaster stays, for its capture. */
  holdToast?: boolean;
  /** A tapped slot marked at this time, as the New block sheet opens there. */
  tapAt?: string;
  /** The column scrolled so this time is at its top. */
  scrollTo?: string;
  /** A bounds edit made on load, so Saving, Saved and Not saved are caught. */
  staged?: { upAt: string; lightsOut: string };
  /** `hang`: the bounds write stays sending (Saving's capture). */
  save?: "hang";
  /** Saved stays, for its capture, instead of going after 2 s. */
  holdSaved?: boolean;
  /** The bounds were just set here: the copy offer, not the card (USE-45). */
  justSet?: boolean;
  /**
   * Copy from's step on load (USE-45): the picker, Replace's ask or the
   * copy made (from `copyFrom`, Monday 0 by default), or From a saved
   * block's picker.
   */
  copy?: "picker" | "replace" | "copied" | "saved";
  copyFrom?: number;
  /**
   * Add event on load (USE-53): its sheet open with these fields typed, or
   * (`add`) the add sent once, so the band or own block and its Toaster show.
   */
  event?: {
    title?: string;
    tag?: "work" | "personal";
    startsAt: string;
    endsAt?: string;
    /** A Work event's client (the desk's Client). */
    clientId?: string;
    add?: boolean;
  };
}

/**
 * Copy from's step on load: the scenario's, else the picker when the URL
 * asks for it (`daysRoute({ copy: "picker" })`, Review the day's Copy
 * another day, USE-110).
 */
export function openingCopyStep(
  start: Pick<SetUpScenarioStart, "copy"> | undefined,
  param: string | null,
): SetUpScenarioStart["copy"] {
  return start?.copy ?? (param === "picker" ? "picker" : undefined);
}
