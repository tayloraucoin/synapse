import type { ReactNode } from "react";

/**
 * `@/lib/fixtures/parts` in a production build (`next.config.ts`, USE-108):
 * no parts registered. The dev parts page is a 404 there anyway.
 */
export function findPart(): (() => ReactNode) | undefined {
  return undefined;
}

export function partNames(): string[] {
  return [];
}
