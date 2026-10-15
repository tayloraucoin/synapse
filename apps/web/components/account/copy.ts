/**
 * The Install sheet's words (USE-83; install-sheet/words-and-access.md), as
 * drawn. Every step is an imperative; none addresses anyone. The browsers'
 * own controls keep the browsers' own capitals.
 */
export const INSTALL_COPY = {
  title: "Install Synapse",
  close: "Close",
  tabs: { iphone: "iPhone", android: "Android" },
  iphone: [
    "Tap the ••• beside the address bar.",
    "Tap Share.",
    "Tap Add to Home Screen.",
    "Leave “Open as Web App” on.",
    "Tap Add.",
  ],
  android: [
    "Tap the ⋮ menu.",
    "Tap Install app, or Add to Home screen.",
    "Tap Install.",
  ],
  footer: "Then open Synapse from the home screen.",
  otherBrowser: "Open this page in Safari first.",
  install: "Install",
  installLabel: "Install Synapse",
  orFromMenu: "Or from Chrome’s menu",
  addWord: "Add",
} as const;
