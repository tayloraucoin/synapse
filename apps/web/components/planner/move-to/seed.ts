/** A scenario's "item:move:pick:<date>": Move to's Pick a day open on the date. */
export function seededMovePick(open: string | undefined): string | null {
  const prefix = "item:move:pick:";
  return open?.startsWith(prefix) ? open.slice(prefix.length) : null;
}
