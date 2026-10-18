import type { FixtureEntry } from "@/lib/data/source";

/**
 * `@/lib/fixtures/entry` in a production build (`next.config.ts`, USE-108):
 * no fixtures, so `?state=` is ignored and the source is always live.
 */
export const fixtures: FixtureEntry | null = null;
