---
paths:
  - "**/package.json"
  - ".yarnrc.yml"
---

# Dependencies

- Before adding or bumping a dependency, add or update its row in `docs/engineering/tech-stack.md`: owner, expiry condition, ruling. No row, no dependency.
- Pin exactly. TypeScript is 5.9.2, not 7 (record 0003). One vendor per category.
- Use `yarn add`; the age gate (`npmMinimalAgeGate: 7d` in `.yarnrc.yml`) makes a release wait a week, and the gate is never lowered or removed.
- One exception (EN-14): a security fix younger than a week enters as one exact `name@x.y.z` in `npmPreapprovedPackages`, never a range, glob or bare name, in the same commit as a ledger line naming the advisory; the entry comes out once the version is a week old.
