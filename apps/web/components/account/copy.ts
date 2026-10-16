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

/**
 * Settings › Connections with clients on, the client sheet and the
 * workspace sheet (USE-86; account/settings/words-and-access.md), as drawn.
 * No second person; the counts are of projects, never of the day.
 */
export const CLIENTS_COPY = {
  linear: "Linear",
  addWorkspace: "Add a workspace",
  connected: "Connected",
  title: "Clients",
  explainer: "Group work by who it's for. Off by default.",
  orderLine: "In this order in the pool. Hold the grip to reorder.",
  listLabel: "Clients, in pool order",
  addClient: "Add a client",
  personalLine: "Work with no client shows under Personal.",
  clientRow: (name: string, covers: string) => `${name}, ${covers}`,
  workspaceRow: (name: string, line: string) => `${name}, ${line}`,
  close: "Close",
  removed: (name: string) => `${name} removed. Its work is under Personal.`,
  client: {
    title: "Client",
    upload: "Upload a logo",
    uploadLine: "Or the letter and colour, as here",
    name: "Name",
    colour: "Colour",
    colourLine: "Sky, plum and clay stay with Work, events and firing.",
    linear: "Linear",
    save: "Save",
    nothingToSave: "Nothing to save yet",
    notSaved: "Not saved. Try again.",
    remove: "Remove client · its work moves to Personal",
    removeLabel: (name: string) => `Remove client ${name}`,
    colours: {
      rose: "Rose",
      leaf: "Leaf",
      amber: "Amber",
      moss: "Moss",
      slate: "Slate",
      ink: "Ink",
    },
  },
  workspace: {
    line: (synced: string) => `Linear workspace · connected · ${synced}`,
    whose: "Whose work is it",
    oneClient: "One client",
    perProject: "Set per project",
    workspaceClient: "Client",
    projects: "Projects",
    noClient: "No client",
    projectClient: (project: string, value: string) =>
      `${project} client, ${value}`,
    footnote:
      "The project emoji comes from Linear, or set one here. A project's client never writes to Linear.",
    disconnect: (name: string) => `Disconnect ${name}`,
  },
} as const;

/**
 * Settings and Settings › Connections (USE-85; account/settings/
 * words-and-access.md), as drawn; the undrawn lines are [PROPOSED] in N2's
 * register. No second person.
 */
export const SETTINGS_COPY = {
  title: "Settings",
  back: "Now",
  backLabel: "Back to Now",
  connections: "Connections",
  signOut: "Sign out",
} as const;

export const CONNECTIONS_COPY = {
  back: "Settings",
  backLabel: "Back to Settings",
  title: "Connections",
  google: "Google Calendar",
  account: (label: string) => `${label} account`,
  googleLine:
    "Events answered yes sit on the day. Maybe or not answered show faintly, to add if wanted.",
  addGoogle: "Add a Google account",
  linearLine: (name: string) =>
    `Issues assigned to ${name}, to slot into work blocks.`,
  more: (name: string) => `More for ${name}`,
  disconnect: "Disconnect",
  disconnected: (name: string) => `${name} disconnected.`,
  notConnected: "Not connected.",
  notSaved: "Not saved.",
  tryAgain: "Try again",
  calendarsFailed: "Calendars didn't load.",
  connectionsFailed: "Connections didn't load.",
  offline: "Offline. Changes wait until the connection is back.",
  connecting: (label: string) => `${label}, connecting`,
} as const;
