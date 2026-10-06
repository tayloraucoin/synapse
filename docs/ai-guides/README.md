# Domain guides for agents

Read the relevant guide **before** that kind of work. These sit below
[`../architecture/codebase-conventions.md`](../architecture/codebase-conventions.md)
(the locked contract) and above ad-hoc judgment.

| Kind of work | Guide |
|---|---|
| Colours, spacing, radius, motion — which token to type | [brand-tokens.md](brand-tokens.md) |
| Which typography component, and when | [typography-guidelines.md](typography-guidelines.md) |
| `className` and Tailwind patterns | [classnames.md](classnames.md) |
| Component anatomy, props, stories | [component-guidelines.md](component-guidelines.md) |
| Anything a person will read | [copy-conventions.md](copy-conventions.md) |
| Schema and RLS authoring | [db-and-rls-authoring.md](db-and-rls-authoring.md) + [../architecture/drizzle-orm-conventions.md](../architecture/drizzle-orm-conventions.md) |
| Procedures, context, errors | [trpc-foundation-patterns.md](trpc-foundation-patterns.md) |

**The visual authority is the official UX spec §9**
([`../ux/ux-spec-v1.md`](../ux/ux-spec-v1.md)),
expressed as `packages/config/tailwind/preset.css`. The component contracts are
the v2 handoff
([`../ux/synapse_ui_component_needs_and_handoff_v2.md`](../ux/synapse_ui_component_needs_and_handoff_v2.md)).
Where a guide here and one of those disagree, the UX document wins and the guide
is the defect.
