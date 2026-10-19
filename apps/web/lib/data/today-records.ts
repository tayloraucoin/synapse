import type { BlockItemRecord, DayReadOutput } from "@syn/validators";

/**
 * What a day's read returns (USE-7): one date's rows, and the pools the day
 * draws on. Its type is `planner.today`'s output schema (USE-91), so the
 * fixture server and the router cannot drift; every list is a
 * `@syn/validators` record.
 */
export type TodayRecords = DayReadOutput;

/**
 * The date's items as the day reads them (USE-87): a slot's own time and icon
 * stand over the item's for its date; the usual item is unchanged. A write
 * reads `records.blockItems`, never this.
 */
export function itemsOnDate(records: TodayRecords): BlockItemRecord[] {
  const own = new Map(
    records.slots
      .filter(
        (slot) =>
          slot.blockItemId !== null &&
          slot.onDate === records.date &&
          (slot.atTime !== null || slot.icon !== null),
      )
      .map((slot) => [slot.blockItemId!, slot]),
  );
  if (own.size === 0) return records.blockItems;
  return records.blockItems.map((item) => {
    const slot = own.get(item.id);
    if (!slot) return item;
    return {
      ...item,
      atTime: slot.atTime ?? item.atTime,
      icon: slot.icon ?? item.icon,
    };
  });
}
