/**
 * The selection grammar — UX v1.3 R56, §4 frame rules (DAY-1).
 *
 * "A chosen `SelectRow` or `LargeTargetRow` is `bg-surface`, a 1.5px
 * `border-ink`, and a check at 20px in the trailing slot; the text stays ink;
 * hover on an unchosen row is `bg-surface` alone. The ink fill (`bg-primary`)
 * is the primary button's and the `Stepper17` cell's, nowhere else."
 *
 * One string per state, so the two choosers cannot drift into two grammars.
 * The unchosen border is 1.5px too (in `hairline`), so a row does not shift
 * by half a pixel when it is chosen.
 */
export const SELECTION_CHOSEN = "bg-surface border-ink text-ink border-[1.5px]";

export const SELECTION_UNCHOSEN = "border-hairline text-ink border-[1.5px] hover:bg-surface";
