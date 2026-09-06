/**
 * The in-context reminder ask — official spec §8.3, and ST-07's lines.
 */
export const REMINDER_COPY = {
  /** Announced, not shown: the sheet has no visible title (§8.3). */
  sheetTitle: "Reminders",
  /** §8.3, verbatim. */
  body: (time: string) =>
    `Want a reminder at ${time} when this comes up? Reminders are only ever the times you set.`,
  /**
   * The iOS-in-a-browser variant, where the answer is an install rather than a
   * permission.
   *
   * [COPY — needs Vesper sign-off]
   */
  installBody: "Reminders on iPhone need Synapse on your home screen.",
  turnOn: "Turn on reminders",
  howToInstall: "How to install",
  notNow: "Not now",

  /* ------------------------------------------------------------ ST-07 -- */
  title: "Notifications",
  granted: "Reminders are on for this device.",
  denied:
    "Reminders are off. Turn them on in your device settings to get the times you set.",
  notInstalled:
    "Install Synapse to your home screen to get reminders on iPhone.",
  notAsked: "Reminders aren't turned on yet.",
  /**
   * A desktop browser with no push support at all. The document gives no
   * sentence for it, and the state has no action — there is nothing to turn
   * on.
   *
   * [COPY — needs Vesper sign-off]
   */
  unsupported: "This browser can't receive reminders.",
  how: "How",
  /**
   * `subscribeToPush` returned `error` — the VAPID key is missing on this
   * tier, or the push service refused. Deliberately not the denied line: the
   * person did not deny anything.
   *
   * [COPY — needs Vesper sign-off]
   */
  subscribeFailed: "Couldn't turn on reminders. Try again.",

  /* --------------------------------------------------- the row headings -- */
  whenAnItemStarts: "When an item starts",
  reviews: "Reviews",
  planning: "Planning",

  itemStart: "Fixed-time items, at the time you set",
  reviewReminder: "Close out today",
  reviewReminderTime: "Close out today, time",
  pendingReview: "Yesterday's pending items, the morning after",
  weekBuild: "Next week isn't planned yet",
  weekBuildDay: "Next week isn't planned yet, day",
  weekBuildTime: "Next week isn't planned yet, time",

  /** §8.5, verbatim — the closing line, not a control. */
  closingLine:
    "Nothing arrives after you've marked a day complete, and nothing is ever sent about missed items.",

  /* ------------------------------------------------------------ ST-06 -- */
  reasonsTitle: "Reasons",
  reasonsIntro:
    "When something's missed, you pick a reason. The reason decides how it counts.",
  add: "Add",
  tierCircumstance: "Something came up — counts as done for the record",
  tierScoping: "Planned it wrong — counts half",
  tierChoseNotTo: "Didn't do it — counts as missed",
  tradedUpLine:
    '"Stayed on something more important" can count as done for the record when the thing you stayed on was at least as important and got done.',
  defaultTag: "default",
  archive: "Archive",
  restore: "Restore",

  /* ----------------------------------------------------------- ST-06a -- */
  newReason: "New reason",
  editReason: "Edit reason",
  reasonLabel: "Reason",
  countsAs: "Counts as",
  tierLocked: "This one's tier can't change.",
  duplicateReason: "You already have this reason.",
  cancel: "Cancel",
  save: "Save",
} as const;
