import { CONTACT_EMAIL } from "@syn/constants";

/**
 * SY-01's strings — cross-cutting §10, verbatim.
 *
 * THE BODY IS WHAT YOU WOULD TELL A FRIEND. *A private daily list.* is the
 * first sentence of the product and the one this screen exists to make
 * repeatable — someone reading About is often about to explain the app to
 * someone else.
 *
 * *it goes to the person who builds this* IS LITERALLY TRUE in Phase 1: the row
 * is the inbox and there is no ticketing system between the two. If that ever
 * changes — a support desk, a queue, an autoresponder — this sentence has to
 * change with it, because the reason people write is that they believe it.
 */
export const ABOUT_COPY = {
  title: "About",
  name: "Synapse",
  /** "0.1.0 · 2026-09-06" */
  versionLine: (version: string, buildDate: string) =>
    `${version} · ${buildDate}`,
  body: "A private daily list. Habits, tasks, appointments, and deep work in one place, closed honestly each night.",

  feedbackHeading: "Feedback",
  feedbackBody:
    "Something broken or confusing? Say so — it goes to the person who builds this.",
  messageLabel: "Message",
  includeContext: "Include which screen I'm on and my app version",
  includeContextHelper: "Nothing from your list is included.",
  send: "Send",
  sent: "Sent. Thanks.",
  emptyMessage: "Write something first.",

  /**
   * The failure sentence, with the address only when there is one.
   *
   * NEVER AN EMPTY ADDRESS. `CONTACT_EMAIL` is `""` until it is set, and
   * *Try again, or email .* is worse than no offer at all — so the sentence
   * ends at *Try again.* until the constant has a value. The dev's call the
   * ticket asks for, made and logged.
   */
  sendFailed: CONTACT_EMAIL
    ? `Couldn't send. Try again, or email ${CONTACT_EMAIL}.`
    : "Couldn't send. Try again.",

  shortcutsHeading: "Keyboard shortcuts",
  shortcutsKeys: "Keys",
  shortcutsAction: "Action",

  legalHeading: "Legal",
  privacy: "Privacy",
  terms: "Terms",
} as const;
