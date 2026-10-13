/**
 * Enum parity — the one place the non-negotiable "a value the DB stores and a
 * value a component chooses must be the same string" is enforced by the type
 * system rather than by review.
 *
 * `pgEnum` takes a tuple of literals; `@syn/types` has the union. Wrapping the
 * tuple in `enumValues<Union>()` makes both mistakes fail the type-check. Both
 * were verified by inducing them:
 *
 * - A TYPO fails at the declaration, with the fix in the message:
 *   `Type '"task_apointment"' is not assignable to type 'ItemType'. Did you
 *   mean '"task_appointment"'?`
 * - An OMISSION fails at the declaration too (USE-2; it used to fail only at
 *   the first insert, which a table no service writes yet never reaches): the
 *   argument must then also carry a `missing` key naming the absent members,
 *   so the error reads `Property 'missing' is missing … { missing: "todos" }`.
 * - An EXTRA value is a value outside the union, so it is the typo case.
 *
 * The list may be a `@syn/constants` tuple (`enumValues<TodoType>()(TODO_TYPES)`),
 * which is how an enum's values are spelled once (USE-2).
 *
 * The generated SQL is unchanged; the call is an identity at runtime.
 *
 *   export const itemTypeEnum = pgEnum(
 *     "item_type",
 *     enumValues<ItemType>()(["habit", "task_appointment", "deep_work"]),
 *   );
 */

type Missing<TUnion extends string, TValues extends readonly string[]> = Exclude<
  TUnion,
  TValues[number]
>;

/** Satisfied by any argument when nothing is missing; otherwise names the gap. */
type Complete<TUnion extends string, TValues extends readonly string[]> = [
  Missing<TUnion, TValues>,
] extends [never]
  ? unknown
  : { readonly missing: Missing<TUnion, TValues> };

export function enumValues<TUnion extends string>() {
  return <const TValues extends readonly [TUnion, ...TUnion[]]>(
    values: TValues & Complete<TUnion, TValues>,
  ): TValues => values;
}
