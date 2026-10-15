/**
 * Set my days' words (USE-39; set-my-days/words-and-access.md). No second
 * person, no counts about the day; times and lengths are the only numbers.
 */
export const DAYS_COPY = {
  title: "Set my days",
  /** The crumb names the tab it came from [ASSUMPTION: every frame draws "Now"]. */
  now: "Now",
  backToNow: "Back to Now",
  week: "Week",
  backToWeek: "Back to the week",
  whichWeek: "Which week",
  usualWeek: "Usual week",
  thisWeek: "This week",
  everyWeek: "Every week",
  previousWeek: "Previous week",
  nextWeek: "Next week",
  weekOf: (range: string) => `Week of ${range}`,
  /** Under This week's list (the-week.md). */
  weekHint: "Tap a day to open it on the time column.",
  days: "Days",
  day: "Day",
  /** A chip's name (N2): "Monday, set"; dated "Monday 12 October, set". */
  chip: (name: string, set: boolean) => `${name}, ${set ? "set" : "not set"}`,
  upAt: "Up at",
  lightsOut: "Lights out",
  dayMenu: (day: string) => `${day} menu`,
  /** Empty, first day (empty-first-day.md). */
  firstDayHeading: "Set when the day starts and ends.",
  firstDayBody:
    "They are the top and bottom of the day. Blocks go in between. Orient takes the first 5 minutes.",
  /** The grey suggestions, never saved as a time. */
  suggestUpAt: "07:00",
  suggestLightsOut: "22:30",
  orient: "Orient, 5 minutes, always first",
  changeItsTime: "Change its time",
  /** The + and its menu (plus-menu.md). */
  addTo: (day: string) => `Add to ${day}`,
  closeAdd: "Close",
  block: "Block",
  blockLine: "Wellness, Training, Work, Break, Evening",
  transition: "Transition",
  transitionLine: "A drive, a meal, a move between blocks",
  fromSaved: "From a saved block",
  fromSavedLine: "One from another day, with its items",
  /** This week only (plus-menu.md). */
  event: "Event",
  eventLine: "At a set time, this date only",
  /** The day's ··· (day-menu.md, D-USE-87). */
  copyFrom: "Copy from…",
  resetTo: (weekday: string) => `Reset to usual ${weekday}`,
  clearDay: "Clear this day",
  cancel: "Cancel",
  clear: "Clear",
  undo: "Undo",
  /** A usual change names its reach (usual-change-reaches.md). */
  seeIt: "See it",
  /** Offline (offline.md, D-USE-82). */
  offline: "Offline. Changes wait until the connection is back.",
  /** The 1024 list-detail's panes (the-day.md). */
  weekPane: "The week",
  dayPane: "The day",
  /** The header's SaveStatus (saved.md). */
  saving: "Saving",
  saved: "Saved",
  notSaved: "Not saved ·",
  tryAgain: "Try again",
  /** Loading and error (loading.md, error.md). */
  dayLoading: "The day is loading.",
  dayFailed: "The day didn't load.",
  dayFailedDetail:
    "Nothing was lost. The other days still open from the chips.",
  /** The install offer, once (install-offer.md). */
  installOffer: "Synapse can go on the home screen.",
  how: "How",
} as const;
