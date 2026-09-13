/**
 * The journal's strings — UX v1.1 §7.2. The prompts are the person's (their
 * `journal_prompts`); this file holds only the chrome, and the chrome holds
 * nothing about the person: no count, no ceremony, no starter phrase.
 */
export const JOURNAL_COPY = {
  title: "Journal",
  /** [COPY — needs Vesper sign-off: a past day with nothing written.] */
  nothingWritten: "Nothing written.",
  /** §7.2's retrying state, verbatim. */
  savingOnThisDevice: "Saving on this device",
  offline: "Offline — your words stay here until you're back.",
} as const;
