# Operator notes, a convention and a template

**Date:** 2026-10-09 · **PEM source:** new; nearest is `docs/product/` and Alembic's role at `62d344b` · **In Synapse:** `docs/product/operator-notes/README.md`, `docs/product/operator-notes.template.md` · **For:** PEM · **Status:** proposed

## What changed

What the operator says in a session (a walkthrough, a review, a brain dump, a refinement round) is filed as operator notes before anything is made of it. Bullets go in the order spoken, under topic headings as they arose, in the operator's exact words wherever possible. The words are cleaned of fillers, but the notes are never a raw transcript and nothing is added: a paraphrase is labelled and an inference is marked `[ASSUMPTION: …]`. Each file is dated and names every file it fed. It is amended with dated blocks (a refinement round, a correction) and never rewritten. The UX stage's narrative pass loads the notes the brief names.

## Files

- `docs/product/operator-notes/README.md`: new; the convention, where the notes live, and how the earlier walkthrough-feedback files relate.
- `docs/product/operator-notes.template.md`: new, beside the other product templates.
- `docs/workflows/stages/ux.md`: the Loads row for the notes (logged in [the narrative adaptation](2026-10-09-narrative-ux-spec.md)).
- `docs/workflows/glossary.md`: Operator notes.

## Why

Taylor asked for it (2026-10-09). Synapse's walkthrough-feedback files, for example `docs/product/2026-09-24-first-run-walkthrough-feedback-v1.2.md`, mix Taylor's words with rulings, severity and where each lands, so a later reader cannot always tell what was said from what was decided. The narrative's fidelity check needs a source it can trace to. The discipline (verbatim is verbatim, paraphrase labelled, nothing added) is Alembic's.

## For a PEM sync

Carry back whole. Judgment, for the sync to settle: filled notes live under `docs/product/operator-notes/` in Synapse, because `docs/product/` is Synapse's own product layer. In a starter, where `docs/` is the practice and filled copies live with the product (`.claude/rules/docs.md`), the folder belongs beside the product's specs instead.
