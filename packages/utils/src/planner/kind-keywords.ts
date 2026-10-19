/**
 * A block kind's words (USE-145; icon-picker/index.md): what "Suggested for
 * <name>" matches when the name's own words match nothing, so a block named
 * "Zzz" or "Mornings" still opens on icons that fit its kind. On the device,
 * no request and no model call (record 0001; D-USE-35). The words are the
 * kind's purpose, never its place (kinds name purpose).
 */
import type { StoredBlockKind } from "@syn/types";

export const KIND_KEYWORDS: Partial<Record<StoredBlockKind, string>> = {
  wellness: "wellness meditation yoga stretch health heart calm breathe",
  training: "training exercise gym run sport fitness muscle",
  work: "work laptop briefcase office desk computer focus",
  life: "home house life chores family errand",
  todos: "list checklist todo task check note",
  break: "break coffee tea rest pause food",
  evening: "evening moon night sleep bed relax",
  transition: "walk travel car commute move",
};

/** The kind's words, or none for a kind with no entry. */
export function kindKeywords(kind: string | null | undefined): string {
  if (kind === null || kind === undefined) return "";
  return KIND_KEYWORDS[kind as StoredBlockKind] ?? "";
}
