/**
 * ST-00, ST-01, ST-08, ST-09 and ST-11's strings — Epic 1 §7 and §1 AU-06,
 * verbatim.
 *
 * They share one file because they share one screen family: a person moving
 * between the index and four sections should meet one voice, and the sentence
 * that says a photo is optional should not be rewritten by whoever builds the
 * fifth section.
 */
export const SETTINGS_COPY = {
  /* ------------------------------------------------------------ ST-00 -- */
  title: "Settings",
  resumeSetup: "Setup isn't finished — continue",
  habits: "Habits",
  habitsCount: (n: number) => `${n} ${n === 1 ? "habit" : "habits"}`,
  templates: "Templates",
  templatesCount: (n: number) => `${n} ${n === 1 ? "template" : "templates"}`,
  week: "Week",
  weekCount: (n: number) =>
    `This week: ${n} ${n === 1 ? "day" : "days"} planned`,
  categories: "Categories",
  categoriesCount: (n: number) => `${n}`,
  reasons: "Reasons",
  reasonsDescription: "What you can pick when something's missed",
  notifications: "Notifications",
  notificationsDescription: "Reminders are only the times you set",
  dayAndTime: "Day & time",
  dayAndTimeDescription: "Wake time, day close, time zone",
  appearance: "Appearance",
  appearanceDescription: "System / Light / Dark",
  yourData: "Your data",
  yourDataDescription: "Export or delete everything",
  shareTheApp: "Share the app",
  about: "About",
  aboutDescription: "Version, feedback, keyboard shortcuts",
  signOut: "Sign out",
  /** "0.1.0 · 2026-09-05" */
  versionLine: (version: string, buildDate: string) =>
    `${version} · ${buildDate}`,

  /* ------------------------------------------- AU-06, the sign-out dialog */
  signOutTitle: "Sign out?",
  signOutBody: "Your data stays in your account.",
  signOutOfflineBody:
    "You're offline — a running timer won't be saved until you're back. Sign out anyway?",
  staySignedIn: "Stay signed in",

  /* ------------------------------------------------------------ ST-01 -- */
  account: "Account",
  changePhoto: "Change photo",
  removePhoto: "Remove photo",
  name: "Name",
  email: "Email",
  password: "Password",
  changePassword: "Change password",
  currentPassword: "Current password",
  newPassword: "New password",
  newPasswordHelper: "At least 8 characters.",
  confirmPassword: "Confirm",
  updatePassword: "Update password",
  wrongCurrentPassword: "That's not your current password.",
  passwordsDoNotMatch: "These don't match.",
  googleOnly: "You sign in with Google.",
  emailPending: (newEmail: string) =>
    `Check ${newEmail} to confirm the change. Your current email works until then.`,
  emailInUse: "There's already an account with this email.",
  saveChanges: "Save changes",
  saveFailed: "Couldn't save. Try again.",

  /* ------------------------------------------------------------ ST-08 -- */
  usualWakeTime: "Usual wake time",
  usualWakeTimeHelper: "Used as the start time for new templates.",
  wakeUpHabit: "Wake-up habit",
  wakeUpHabitHelper:
    "Marking it done sets the day's wake time. Set this on a habit.",
  none: "None",
  dayClosesAt: "Day closes at",
  dayClosesAtHelper:
    "Anything undone at this time waits for you to review. Nothing is marked missed on its own.",
  reviewReminder: "Review reminder",
  reviewReminderHelper: "Also under Notifications.",
  timezone: "Time zone",
  appliesFromTomorrow: "Applies from tomorrow.",

  /* ------------------------------------------------------------ ST-09 -- */
  appearanceHelper: "Follows your device unless you choose.",

  /* ------------------------------------------------------------ ST-11 -- */
  shareBody:
    "Synapse is free. Anyone you share it with gets their own private list — you can't see theirs and they can't see yours.",
  share: "Share",
  copyLink: "Copy link",
  copied: "Copied.",
} as const;

/** How long *Copied.* stays up (Epic 1 ST-11). */
export const COPIED_MS = 2000;
