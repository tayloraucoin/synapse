/** D-USE-36: the description, then the item's notes at its end. */
export function joinNotes(
  description: string | null,
  notes: string | null,
): string | null {
  const parts = [description, notes]
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "");
  return parts.length === 0 ? null : parts.join("\n\n");
}
