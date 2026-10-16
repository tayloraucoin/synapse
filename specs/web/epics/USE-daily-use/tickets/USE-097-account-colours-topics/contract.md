---
size: small
objective: "The avatar menu, the Profile sheet, the icon picker's saved colours and the meal topics read and write Taylor's real account and rows"
slice_type: "small record swaps onto existing and new routers; risks a second account read beside user.me, and a photo upload that bypasses the asset flow"
non_negotiables:
  - "The account reads through the existing user router (user.me, user.avatar, user.updatePreferences, user.setAvatar); no second account service."
  - "The photo goes through asset.createUploadUrl then user.setAvatar, as the old app's flow does; no file passes through tRPC."
  - "Saved colours are unique per user and hex; a duplicate returns the existing row, as the fixture does."
  - "Every query runs inside ctx.rls.execute()."
devs_call: "Router names for saved colours and meal topics; whether they share one router."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/words-and-access.md"
  - "C-USE-profile-sheet-1"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/planner/"
  - "packages/api/src/routers/"
  - "packages/api/src/root.ts"
  - "packages/validators/src/"
  - "apps/web/lib/data/live/"
depends_on:
  - "USE-90"
out_of_scope:
  - "Sign-out and the push toggle: already live"
criteria:
  - id: C1
    statement: "readAccount on the live server returns the AccountView the fixture returns, from user.me and user.avatar"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A saved colour written twice with the same hex returns one row; remove deletes it; meal topics write, list and remove as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A photo chosen in the Profile sheet uploads and shows in the avatar after a reload"
    evidence: manual
    reason: "needs Supabase storage on staging; Taylor checks it once"
  - id: C4
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-97
---

# Contract — account-colours-topics

## Build notes

The base methods `readAccount`, `writeAccountName` and `uploadAccountPhoto`, the saved colours' `listSavedColours`, `writeSavedColour` and `removeSavedColour`, and the meal topics' `listMealTopics`, `writeMealTopic` and `removeMealTopic`.

- **Account:** `live/account.ts` composes `AccountView` from `user.me` and `user.avatar`. The name goes through `user.updatePreferences({ displayName })`, parsed by `displayNameSchema`. The photo follows the old flow: `asset.createUploadUrl`, a PUT of the cropped blob, then `user.setAvatar`. Read `apps/web/_legacy/` for the old call order, never import it.
- **Saved colours and meal topics:** new `planner.savedColours.*` and `planner.mealTopics.*` (or one `prefs` router), over `saved_colours` and `meal_topics`, inputs `savedColourInput` and `mealTopicInput`, plus `idInput`. The unique `(user_id, hex)` turns a duplicate into a read of the existing row.
- **Per path:** tests over in-memory rows for C2. C1 stubs the two user procedures.
- **Gotchas:** the fixture's `SavedColourRefusal` and `MealTopicRefusal` reasons map through `refuse()` (USE-90).
- **Model:** Opus 5.5 at medium.
