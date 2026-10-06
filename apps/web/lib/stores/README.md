# Client state — one tool per kind

There is exactly one Zustand store here, and that is the point. Reach for the
cheapest thing that fits, in this order:

| The state is… | Use | Not |
|---|---|---|
| Server data | **TanStack Query**, through tRPC | never a store, never Context |
| In the URL (a tab, a filter, an open sheet) | **nuqs** | `useState` plus an effect |
| A form's values and errors | **react-hook-form** via `useSynapseForm` | `useState` per field |
| Local to one component | **`useState`** | anything else |
| Shared across a tree, changing rarely | **React Context** | Zustand |
| Shared across a tree, changing at high frequency | **Zustand** | Context |

## Why server data never goes in a store

A store holding a copy of server data has to be invalidated, and nothing tells
it when to be. TanStack Query already knows what is stale, what is in flight,
and what failed. Copying a query result into a store replaces one source of
truth with two, and the second one is always the one that is wrong.

## The Zustand line

Context re-renders every consumer on every change. That is fine at human
frequency — a theme, a signed-in user, an open sheet — and wrong at machine
frequency, where it re-renders a whole subtree many times a second to update
one number.

**The first sanctioned Zustand store is the running-timer tick**, and it now
exists as [`use-timer-store.ts`](use-timer-store.ts), built by USE-3. A timer
publishes elapsed seconds at 1 Hz, and four places read it: the item row, the
item sheet, the tab title, and (Phase 2) the persistent notification. Through
Context, that is the entire day list re-rendering every second.

It holds no server data. Whether a timer EXISTS is a `timer_sessions` row; the
store holds what to draw and is re-seeded from the server on every refetch — so
the rule above is kept, not bent, by the one store that exists.

If you want a SECOND store, the bar is the same one this one cleared: a wide
tree, a high frequency, and a measurement. Otherwise the answer is Context.

## Conscious Connections declares Zustand and has no store

That is not an oversight — it is the rule working. The dependency is present so
the escalation costs nothing when it is genuinely earned. Synapse kept the same
discipline through eleven feature tickets and then spent it once, on the one
thing that measurably needed it.
