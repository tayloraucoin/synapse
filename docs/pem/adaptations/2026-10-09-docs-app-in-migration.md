# The docs app, brought in after the migration

**Date:** 2026-10-09 · **PEM source:** `apps/docs` at `62d344b` · **In Synapse:** `apps/docs`

## What happened

PEM's migrate runbook (`docs/runbooks/migrate/`) did not bring `apps/docs` into the host, so Synapse adopted the practice without a way to read its docs rendered. It was ported by hand afterwards, so Taylor can read `docs/` and `specs/` (above all the narrative UX specs) in a browser, locally. No Vercel project, no deploy.

## For a PEM sync

The migrate runbook should bring `apps/docs` into a host as part of the migration, with the rewires below as steps (or as options in the manifest), rather than leave each host to port it.

## The rewires this port needed

1. **Scope rename.** Every `@pem/*` import became `@syn/*`: `@pem/ui/button`, `/cn`, `/styles/globals.css` to the same paths in `@syn/ui`; `@pem/ui/theme` to `@syn/ui/providers/theme-provider`; `@pem/config/eslint/next-js`, `/tsconfig/nextjs.json`, `/tailwind/preset.css` to `@syn/config`. Synapse's button has no `outline` variant; the 404 link uses `secondary`. The tsconfig adds `moduleResolution: bundler` and `next.config.ts` the `.js` extension alias, as `apps/web` has them, and `@syn/constants` is transpiled because the theme provider imports it.
2. **No brand package.** Synapse has no `@pem/brand`. The name is a literal in the layout's metadata; the font is `next/font` Geist on `--font-geist-sans`, the variable the preset already reads; the icon is a copy of `apps/web/public/icons/icon-192.png` in `apps/docs/public/` (an app may not import another app).
3. **Tokens the preset lacks.** PEM's docs tokens alias `--neutral-700/600/200/350`, `--hover` and `--selected`, none of which Synapse's preset has. They alias `--syn-neutral-700`, `--text-body` and `--muted-foreground` instead (light: body 11.16:1, muted 7.32:1 on page and sidebar; dark: 14.61:1 and 11.83:1, measured in the browser); hover uses `--muted`; selection uses `--accent-hover-surface`. A first mapping one step lighter measured muted at 4.45:1, under AA for the sidebar's small text.
4. **Files with no frontmatter.** PEM groups every doc by its `layer` field and sends a doc without one to Engineering. 228 of Synapse's 339 docs have none (most of `docs/ux/`, the guides, `docs/decisions/imported/`). A doc with a known `layer` still joins that group; one without joins a group named for its top folder under `docs/` (UX, AI guides, Architecture, …). Nothing requires frontmatter.
5. **specs/ rendering.** PEM renders only `docs/` (and `AGENTS.md`). Synapse's tickets and the living UX truth are in the root `specs/`, so it is a second content root mounted at `/specs`, one sidebar group listed last and nested by folder, with `specs/_status.md` as its landing page at `/specs`. `apps/docs/turbo.json` lists `specs/**` as a build input beside `docs/**` and `AGENTS.md`.
6. **Host paths.** The Start group's map is `docs/architecture/directory-map.md` (Synapse has no `docs/_generated/`); Synapse has no hidden layer, so the sidebar's hidden-files line shows only when there are some.
7. **Registration.** `packages/config/eslint/boundaries.js` registers `app-docs`, so the apps-to-apps ban covers it; root `package.json` has `docs:dev`; `AGENTS.md` lists it in Commands. `toolkit.json` does not list the docs app: it has no design layer or ticket prefix. Three `apps/docs` lines left `tooling/refs-pending.json` ("stays in the toolkit"), since the paths now exist; `check-refs` asks for that.

## Measured

391 pages (339 docs, 51 specs, `AGENTS.md`). The search index is 5.67 MB before compression (1.83 MB gzipped), past PEM record 0007's revisit trigger of about 5 MB; left as it is, flagged for the sync.
