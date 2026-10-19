/**
 * Fixed UUIDs, so a `?state=` link and a capture are the same every time.
 * The leading digits name the table (1 blocks, 2 block items, 3 slots, 4 work
 * items, 5 clients, 6 to-dos, 7 slot events, 8 day events, 9 saved
 * colours, 0 the morning: passages from 1, links from 11, the quote from 21,
 * day records from 31, and meal topics from 41); the rest count.
 */
export function fixtureId(table: number, n: number): string {
  const tail = `${table}${String(n).padStart(11, "0")}`;
  return `00000000-0000-4000-8000-${tail}`;
}
