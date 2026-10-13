/**
 * Fixed UUIDs, so a `?state=` link and a capture are the same every time.
 * The leading digits name the table (1 blocks, 2 block items, 3 slots, 4 work
 * items, 5 clients, 6 to-dos, 7 slot events, 8 day events); the rest count.
 */
export function fixtureId(table: number, n: number): string {
  const tail = `${table}${String(n).padStart(11, "0")}`;
  return `00000000-0000-4000-8000-${tail}`;
}
