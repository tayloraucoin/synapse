# `docs/ux/` — Synapse product source of truth

| Doc | One line |
|-----|----------|
| `habit_tracker_official_ux_spec_v1.md` | **The master spec** — data model (§3), state matrix (§5.9), brand guide (§9, incl. the §9.7 variable map), copy guide (§10). Its §0.3 rulings are signed. |
| `epic1_setup_ux_architecture.md` | Epic 1 — auth, first run, library, categories, templates, week build, settings. Inventory §12. |
| `epic2_in_use_ux_architecture.md` | Epic 2 — shell, Plain List, day header, item sheet, Schedule, shift, trim, notification landings. Inventory §11. |
| `epic3_review_ux_architecture.md` | Epic 3 — Review tab, Day Review with tiered miss scoring, Week Review, history. Inventory §9. |
| `synapse_navigation_and_system_ux_architecture.md` | Cross-cutting — navigation, layouts, routing (§4.1), PWA, offline/sync, time rules, record integrity, system screens. Inventory §12. |
| `synapse_ui_component_needs_and_handoff.md` | v1 of the component handoff — **superseded by v2**, kept for the record. |
| `branding-guide.md` | **Derived, not authoritative** — the brand assembled on one page from §9, §10, §2, §11 and `preset.css`, for orientation. Cite the sources, not this. |
| `synapse_ui_component_needs_and_handoff_v2.md` | **v2 component handoff** — CC-convention re-slot, props contracts, install script, token file, build order, parity checklist. Restored by Taylor on 2026-09-04 after the repo re-scaffold dropped it. Its §3.1 single-app call (D1) is superseded by the Turborepo — see `docs/specs/infrastructure/README.md` § Handoff path remap. |

Authority: the official spec first; the epic documents for their own screens; the cross-cutting document between them; the v2 handoff for component contracts. UX documents are never edited to match what shipped — divergences go to the relevant track's `DEVIATIONS.md`.
