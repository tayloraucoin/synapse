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

/**
 * The Profile sheet's words (USE-84; profile-sheet/words-and-access.md), as
 * drawn. No second person; no numbers.
 */
export const PROFILE_COPY = {
  title: "Profile",
  close: "Close",
  photo: "Profile photo",
  changePhoto: "Change photo",
  addPhoto: "Add photo",
  name: "Name",
  email: "Email",
  save: "Save",
  nothingToSave: "Nothing to save yet",
  uploading: "Uploading",
  photoUpdated: "Photo updated",
  notSaved: "Not saved. Try again.",
  crop: {
    back: "Profile",
    backLabel: "Back to Profile",
    heading: "Crop photo",
    region: "Photo crop",
    zoom: "Zoom",
    hint: "Drag to move, pinch or slide to zoom.",
    use: "Use photo",
  },
} as const;
