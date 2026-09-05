import { redirect } from "next/navigation";

import { signInRoute } from "@/lib/routes";

import { resolveEntryForRequest } from "@/lib/entry/resolve-entry-for-request";

/**
 * `/` never renders. Cross-cutting §4.2: every cold open and every `/` runs
 * the entry decision tree and lands somewhere specific.
 */
export default async function RootPage() {
  const destination = await resolveEntryForRequest();
  redirect(destination ?? signInRoute());
}
