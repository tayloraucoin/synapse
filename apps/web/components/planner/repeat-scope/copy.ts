/**
 * The scope question's words (USE-47; custom-recurrence.md, D-USE-24): asked
 * when a repeating block is changed from a dated day. No second person.
 * [ASSUMPTION] The title, the body and each choice's line are proposed;
 * the three choices are the board's, as Google asks them.
 */

export type RepeatScopeAnswer = "this" | "following" | "all";

export const REPEAT_SCOPE_COPY = {
  /** "Move Wellness to 8:30?" */
  moveTitle: (name: string, at: string) => `Move ${name} to ${at}?`,
  body: (name: string) => `${name} repeats. Which dates take the change?`,
  choices: [
    {
      scope: "this",
      label: "This one",
      line: (date: string) => `${date} only`,
    },
    {
      scope: "following",
      label: "This and following",
      line: (date: string) => `From ${date} on`,
    },
    { scope: "all", label: "All", line: () => "Every date it repeats" },
  ] as const satisfies readonly {
    scope: RepeatScopeAnswer;
    label: string;
    line: (date: string) => string;
  }[],
  cancel: "Cancel",
  /** The Toaster after This and following, with Undo. */
  followingDone: (name: string, date: string) =>
    `${name} changed from ${date} on.`,
  /** The Toaster after All, with Undo. */
  allDone: (name: string) => `${name} changed on every date.`,
} as const;
