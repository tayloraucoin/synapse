---
id: USE-118
size: small
objective: "The meal's Open in YouTube LinkCallout leads with a play-glyph tile and ends with the outward arrow ↗, as drawn and as Orient's callouts read"
slice_type: "a composite's leading and trailing marks brought to the frame; risks the callout's Spotify use on Orient changing with it"
non_negotiables:
  - "No red and no YouTube logo (D-USE-28; meal-topic-picked.md)."
  - "Orient's Spotify callouts keep their look unless the same change is the drawn one there too."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "Whether the tile is a LinkCallout slot or the meal's own leading node; which icon is the outward arrow."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/meal-topic-picked.md"
  - "D-USE-28"
  - "D-USE-30"
truth_files: "none: the epic's ux/ already describes the drawn form; the build catches up to it"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/display/link-callout/"
  - "apps/web/app/(shell)/today/_components/now/"
  - "specs/web/epics/USE-daily-use/tickets/USE-118-link-callout-play-tile/evidence/"
depends_on: []
out_of_scope:
  - "The topic chips and Edit topics (USE-22, as built)"
  - "What the link opens (interactions/meal-topics.md)"
criteria:
  - id: C1
    statement: "With Agent workflows picked, the LinkCallout shows a neutral tile holding the play glyph, \"Open in YouTube\" in semibold, \"Agent workflows · saved playlist\" muted and ↗ on the right; no red, no logo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-118-link-callout-play-tile/evidence/meal-topic-picked-402.png"
  - id: C2
    statement: "Orient's two Spotify callouts read as before at 402"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-118-link-callout-play-tile/evidence/orient-links-402.png"
  - id: C3
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — link-callout-play-tile

## Build notes

Found by the assay pass against Paper (2026-10-18, thread A, USE-22 C2). Built, the callout opens with a bare outline play triangle and ends with a boxed external-link icon. Paper's `now / meal, topic picked / 402 / light` (x 482, y 11460) and the states file draw "a play-glyph tile, \"Open in YouTube\" (semibold), \"Agent workflows · saved playlist\" (muted), the outward arrow ↗ on the right; hairline, rounded, no fill beyond the background."

- **Approach:** give the meal's callout the tile and the ↗, through LinkCallout's existing slots if it has them. Recapture at `/dev/parts?state=meal-topic-picked`, and Orient's links at `/dev/parts?state=orient-success`.
- **Decisions that apply:** D-USE-28: "the pick comes before the LinkCallout opens YouTube." D-USE-30: "the chips lead with their topic's icon." meal-topic-picked.md: "The LinkCallout is the one Orient draws".
- **Interfaces:** possibly a `leading` or `tile` prop on `LinkCallout`.
- **Per path:** `link-callout/` the component and its stories; the Now meal form's call site.
- **Gotchas:** Orient's frames draw the boxed arrow with the Spotify glyph bare, so a change to LinkCallout's default reaches Orient; C2 holds that line.
- **Model:** Sonnet 5.5 at medium; a smaller model restyles past the frame or drops the existing behaviour.
