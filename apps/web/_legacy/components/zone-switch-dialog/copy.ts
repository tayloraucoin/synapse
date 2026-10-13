/**
 * SY-06's dialog, verbatim from cross-cutting §10 and §7.3.
 *
 * BOTH SENTENCES NAME BOTH ZONES. The whole decision is "which of these two
 * places am I keeping", and a description that said *Today stays as it is.
 * Tomorrow changes.* would make the person open Settings to find out what they
 * just agreed to. It also gives a screen-reader user the two names in order,
 * which is the accessibility note SYS-2 makes.
 *
 * THE CONFIRM IS THE LINE'S VERB. The status line offers *Switch*; the dialog
 * confirms *Switch* (official spec §10.3 — a confirmation reuses the verb of
 * the thing it confirms). The cancel is *Keep*, which names the outcome of not
 * acting rather than the absence of an action.
 */
export const ZONE_SWITCH_COPY = {
  title: (deviceZone: string): string => `Switch to ${deviceZone}?`,
  description: (deviceZone: string, storedZone: string): string =>
    `Today stays on ${storedZone}. Tomorrow starts on ${deviceZone}.`,
  cancel: "Keep",
  confirm: "Switch",
} as const;
