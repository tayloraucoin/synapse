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
 * - An OMISSION fails at the first consumer rather than here: the return type
 *   becomes the sentinel tuple `["MISSING_ENUM_VALUE", <the missing member>]`,
 *   which `pgEnum` accepts, so the sentinel surfaces in the column's type and
 *   every insert of a real value stops compiling. Less direct, still a red
 *   build — and the sentinel's name is in the error, so the cause is legible.
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

type Exhaustive<TUnion extends string, TValues extends readonly TUnion[]> = [
  Missing<TUnion, TValues>,
] extends [never]
  ? TValues
  : readonly ["MISSING_ENUM_VALUE", Missing<TUnion, TValues>];

export function enumValues<TUnion extends string>() {
  return <const TValues extends readonly [TUnion, ...TUnion[]]>(
    values: TValues,
  ): Exhaustive<TUnion, TValues> => values as Exhaustive<TUnion, TValues>;
}
