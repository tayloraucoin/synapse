import { trayClock } from "../todos-tray/copy";

/**
 * The To-do sheet's words (USE-28; day/todo-sheet/words-and-access.md). No
 * second person; times and dates are the only numbers; a failure is a
 * sentence in ink.
 */

/** "Monday, 12 October", for the scope line of a to-do with a day. */
function dayName(dateKey: string): string {
  const [y = 0, m = 1, d = 1] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(/^(\w+) /, "$1, ");
}

const SAVES = "Changes save as they're made.";

export const TODO_SHEET_COPY = {
  title: "To-do",
  newTitle: "New to-do",
  close: "Close",
  more: (title: string) => `More for ${title}`,
  scope: (onDate: string | null) =>
    onDate === null
      ? "To-dos · in the tray, no day yet"
      : `To-dos · ${dayName(onDate)}`,
  titleLabel: "Title",
  titlePlaceholder: "To-do",
  icon: (name: string | null) =>
    name === null ? "Icon. Choose" : `Icon, ${name}. Change`,
  iconBack: (title: string) => title || "To-do",
  type: "Type",
  typeName: (label: string) => `Type, ${label}`,
  repeats: "Repeats",
  repeatsName: (label: string) => `Repeats, ${label}`,
  repeatsNote:
    "A repeat comes back to the tray when it's due, after this one is done.",
  /** A rule the list does not make (Custom… is its own ticket's). */
  customRepeat: "Custom repeat",
  reminder: "Reminder",
  reminderOff: "Off",
  reminderOn: "On: a notification at the time below",
  notInstalled: "Reminders need the installed app.",
  how: "How",
  howName: "How to install, for reminders",
  notificationsOff: "Notifications are off for Synapse.",
  settings: "Settings",
  settingsName: "Notification settings",
  at: "At",
  today: "Today",
  tomorrow: "Tomorrow",
  dayName,
  /** The At row's third option, opening the month (D-USE-69). */
  pickADay: "Pick a day…",
  reminderDay: (day: string) => `Reminder day, ${day}`,
  reminderTime: "Reminder time",
  notes: "Notes",
  notSaved: "Not saved.",
  tryAgain: "Try again",
  footer: {
    default: `${SAVES} It waits in the tray until it's done or a To-dos block takes it.`,
    reminderOn: (at: string) =>
      `${SAVES} If it's checked off before ${trayClock(at)}, the reminder doesn't come.`,
    notInstalled: `${SAVES} Everything else here works in the browser.`,
    notificationsOff: `${SAVES} The reminder switch comes back once notifications are on.`,
  },
  /** ··· (USE-29; more-open.md), all in ink. */
  menu: {
    giveADay: "Give it a day…",
    markDone: "Mark done",
    delete: "Delete to-do",
    deleteDetail: "Gone from the tray and any block. Undo in the toast.",
  },
  /** The month step's title, per way in. */
  step: {
    giveADay: "Give it a day",
    remindOn: "Remind on",
  },
  toast: {
    done: (title: string) => `${title} is done.`,
    deleted: (title: string) => `${title} is deleted.`,
  },
  /** A ··· action that did not save: the sheet stays, the line says so. */
  notSavedAction: "Not saved. Try again.",
  /** The longest title `plannerNameSchema` takes. */
  titleMax: 120,
} as const;
