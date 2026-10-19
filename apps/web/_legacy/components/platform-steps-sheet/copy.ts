/**
 * The steps behind *How* and *How to install*.
 *
 * **[COPY — needs Vesper sign-off: every step string in this file.]** The
 * documents name the platforms and say "numbered steps" but give no step text.
 * These are written in register — plain, second-person-free where the register
 * allows, no exclamation, no encouragement — and are placeholders for wording,
 * not for behaviour.
 *
 * NO SCREENSHOTS, EVER (cross-cutting §5.1). An image of someone else's
 * settings app goes stale the moment the OS ships a new one, and a person
 * comparing a picture to their screen has a harder job than one reading four
 * short lines.
 */
export const PLATFORM_STEPS_COPY = {
  notificationsTitle: "Turn on reminders",
  installTitle: "Install Synapse",

  /** Shown above the list, naming what the steps lead to. */
  notificationsIntro:
    "Reminders were turned off for Synapse. They can be turned back on from the browser or system settings.",
  installIntro:
    "On iPhone and iPad, reminders arrive only when Synapse is on the home screen.",

  steps: {
    "notifications-ios": [
      "Open Settings on the device.",
      "Scroll to Synapse and open it.",
      "Turn Notifications on.",
      "Return here and choose Turn on reminders.",
    ],
    "notifications-android": [
      "Open the browser menu and choose Site settings.",
      "Open Notifications.",
      "Change Synapse to Allow.",
      "Return here and choose Turn on reminders.",
    ],
    "notifications-desktop": [
      "Select the icon at the left of the address bar.",
      "Find Notifications in the list.",
      "Change it to Allow.",
      "Reload this page.",
    ],
    "install-ios": [
      "Open Synapse in Safari.",
      "Select the Share button.",
      "Choose Add to Home Screen.",
      "Open Synapse from the home screen.",
    ],
    "install-android": [
      "Open the browser menu.",
      "Choose Install app, or Add to Home screen.",
      "Confirm.",
      "Open Synapse from the home screen.",
    ],
    "install-desktop": [
      "Select the install icon at the right of the address bar.",
      "Choose Install.",
    ],
  },

  close: "Close",
} as const;

export type PlatformStepsKey = keyof typeof PLATFORM_STEPS_COPY.steps;
