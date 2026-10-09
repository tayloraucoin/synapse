---
paths:
  - "docs/architecture/directory-map.md"
  - "scripts/generate-directory-map.mjs"
---

# House rule: the directory map

- **Never hand-edit the generated tree** in `docs/architecture/directory-map.md` — regenerate via `yarn directory-map`. If a new load-bearing file needs a note, add it to the `ANNOTATIONS` map in `scripts/generate-directory-map.mjs` first.
