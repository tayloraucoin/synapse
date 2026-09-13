/**
 * The anchor a v1.0 reader uses when a template has none — TRANSITIONAL.
 *
 * Since migration 0004 (UX v1.1 §11.4, TD-1) `templates.anchor_time` is
 * nullable: a block template anchors from the profile at materialisation —
 * wake for a morning block, work start for prep, lights-out for wind-down —
 * and only a work template with its own hours carries an explicit override.
 *
 * The v1.0 services (`getTemplate`, `saveSlot`'s collision clock) still read
 * one anchor per template. Until DYN-4 rewrites them to resolve the anchor
 * from the profile by kind, a null anchor falls back to the value the column
 * defaulted to before 0004, which every existing row still carries. DYN-4
 * deletes this file; nothing new may import it.
 */
export const V1_ANCHOR_FALLBACK = "07:00";

export function anchorOrFallback(anchorTime: string | null): string {
  return anchorTime ?? V1_ANCHOR_FALLBACK;
}
