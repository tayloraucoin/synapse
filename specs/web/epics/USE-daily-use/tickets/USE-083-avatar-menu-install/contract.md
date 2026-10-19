---
id: "USE-83"
size: small
objective: "The avatar opens the account menu on every tab and from the rail's footer at the desk: Who, Set my days, Meal topics, then Profile, Install the app (only in a phone browser, not installed) and Settings, no Help, no scrim; Install the app opens the Install sheet on the device's tab with its numbered steps, Safari first on another iPhone browser, Chrome's own Install when it offers one, and no way in once installed or at the desk"
slice_type: "a menu and a how-to sheet; risks Install shown when installed or at the desk, a scrim or sheet where a dropdown is drawn, a Copy link or primary on the Install sheet, a coloured initial, and a platform guess made on the server"
non_negotiables:
  - "Installed (standalone) or 1024 and up: no Install the app row, no offer, no How (C-USE-install-sheet-5, C-USE-avatar-menu-2, -7)."
  - "A DropdownMenu with no scrim; the avatar keeps an ink ring and aria-expanded while open; Escape, Tab or a tap outside closes it and focus returns to the avatar (C-USE-avatar-menu-5)."
  - "No Help row (C-USE-avatar-menu-6); no Copy link and no second person on the Install sheet (C-USE-install-sheet-7)."
  - "No photo: the initial on paper with a hairline, never on a colour (C-USE-avatar-menu-no-photo-1)."
  - "Platform, standalone and the browser's prompt are read on the device after mount; the server renders no guess."
  - "Only @syn/ui components (AppHeader, Avatar, DropdownMenu, ResponsiveSheet, Tabs) and preset tokens."
devs_call: "File split under (shell)/_components/account/; the platform check's home (lib/pwa); the step glyphs (Lucide where one fits, drawn marks otherwise, decorative)."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/avatar-menu/index.md"
  - "specs/web/epics/USE-daily-use/ux/account/avatar-menu/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/account/avatar-menu/states/no-photo.md"
  - "specs/web/epics/USE-daily-use/ux/account/avatar-menu/states/offline.md"
  - "specs/web/epics/USE-daily-use/ux/account/install-sheet/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/account/install-sheet/states/browser-prompt.md"
  - "specs/web/epics/USE-daily-use/ux/account/install-sheet/states/other-browser.md"
  - "C-USE-avatar-menu-1"
  - "C-USE-avatar-menu-2"
  - "C-USE-avatar-menu-3"
  - "C-USE-avatar-menu-4"
  - "C-USE-avatar-menu-5"
  - "C-USE-avatar-menu-6"
  - "C-USE-avatar-menu-7"
  - "C-USE-avatar-menu-8"
  - "C-USE-avatar-menu-no-photo-1"
  - "C-USE-avatar-menu-offline-1"
  - "C-USE-install-sheet-1"
  - "C-USE-install-sheet-2"
  - "C-USE-install-sheet-3"
  - "C-USE-install-sheet-4"
  - "C-USE-install-sheet-5"
  - "C-USE-install-sheet-6"
  - "C-USE-install-sheet-7"
  - "C-USE-install-sheet-browser-prompt-1"
  - "C-USE-install-sheet-browser-prompt-2"
  - "C-USE-install-sheet-other-browser-1"
  - "D-USE-5"
  - "D-USE-28"
  - "D-USE-88"
  - "D-USE-89"
waiver: "The avatar menu, with the Install sheet folded in: the sheet has one way in, the menu's Install the app row (and the offer's How, which opens the same sheet), and shares its install detection."
truth_files: "none: promotion carries account/"
qa: Q1
reviewers:
  - assay
focus:
  - "the menu installed, not installed and with no photo, and the Install sheet's iPhone, Android, browser prompt and other browser states, at 402 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/_components/"
  - "apps/web/components/account/"
  - "apps/web/lib/pwa/"
  - "apps/web/lib/data/use-account.ts"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-083-avatar-menu-install/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
out_of_scope:
  - "Set my days and Meal topics themselves: USE-39 and USE-22; the rows link to them"
  - "The Profile sheet: USE-84; Settings: USE-85"
  - "The once-only install offer on Set my days: USE-39, which opens this sheet"
  - "iOS push on the installed app: an operator check"
criteria:
  - id: C1
    statement: "At 402 in a phone browser not installed, the avatar opens the menu under it with no scrim: the photo, name and email, Set my days, Meal topics, a rule, Profile, Install the app and Settings, each with its glyph, the avatar ringed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-083-avatar-menu-install/evidence/not-installed-402.png"
  - id: C2
    statement: "At 402 installed, the menu has five rows with no Install the app; with no photo, the header avatar and Who show the initial on paper with a hairline"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-083-avatar-menu-install/evidence/installed-no-photo-402.png"
  - id: C3
    statement: "At 1440 the rail footer's avatar opens the same menu with no Install the app"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-083-avatar-menu-install/evidence/rail-menu-1440.png"
  - id: C4
    statement: "At 402 the Install sheet on an iPhone shows \"Install Synapse\", iPhone and Android tabs, the five numbered steps each with its glyph and \"Then open Synapse from the home screen.\", no primary; on Android the three steps; with Chrome's prompt ready \"Install\" with \"Or from Chrome's menu\"; on another iPhone browser \"Open this page in Safari first.\" above the steps"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-083-avatar-menu-install/evidence/install-sheet-402.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — avatar-menu-install

## Build notes

Wave 2. Match `ux/account/avatar-menu/captures/` (installed, not-installed, no-photo) and `ux/account/install-sheet/captures/` (iphone, android, browser-prompt, other-browser).

- **Decisions that apply:**
  - D-USE-5, D-USE-89: the avatar opens this menu instead of Settings; Settings is a row in it; at the desk the rail footer's avatar opens it (USE-4 left the footer for this ticket to make the trigger).
  - D-USE-28: a shadcn `DropdownMenu`, 264 px, anchored under the avatar and right-aligned, background token, hairline, 10 px radius, leading muted icons, 1 px separators, one soft shadow; no scrim.
  - The menu: the avatar ringed in ink while open; Who (40 px photo or initial, the name, the email muted; not a control); a rule; Set my days (calendar), Meal topics (play in a frame); a rule; Profile (person), Install the app (phone with arrow, only while not installed), Settings (cog). D-USE-88: five rows installed, six not; no Help row.
  - Offline: the menu opens as online, every row live.
  - Install sheet: "Install Synapse"; tabs iPhone and Android, the device's selected; iPhone: "Tap the ••• beside the address bar.", "Tap Share.", "Tap Add to Home Screen.", "Leave "Open as Web App" on.", "Tap Add."; Android: "Tap the ⋮ menu.", "Tap Install app, or Add to Home screen.", "Tap Install."; footer "Then open Synapse from the home screen."; × and the grabber close, focus returns to the opener; no primary except Chrome's "Install", which opens the browser's own prompt.
  - D-USE-37: no Copy link.
- **Interfaces:** `AccountMenu { trigger }` mounted in `AppHeader` and the rail footer; `InstallSheet` at `?sheet=install` (`installSheetRoute`); `useInstallState()` in `lib/pwa/` (`platform`, `standalone`, `prompt`); `useAccount()` in `lib/data/` (name, email, photo) on fixtures.
- **Per path:** scenarios `account-menu`, `account-installed`, `account-no-photo`, `install-iphone`, `install-android`, `install-browser-prompt`, `install-other-browser`; a scenario may force `installState` for captures.
- **Gotchas:** the rows for Set my days and Meal topics link USE-39's and USE-22's routes; until they land the links may not resolve, and the captures show the menu only.
- **Model:** Opus 5.5 at medium. A smaller model shows Install when installed, puts the menu in a sheet, or colours the initial.
