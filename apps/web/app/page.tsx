import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/app/_components/landing";
import { LANDING_COPY } from "@/content/landing";

import { resolveEntryForRequest } from "@/lib/entry/resolve-entry-for-request";

/**
 * `/` is two things, decided by whether there is a session.
 *
 * SIGNED IN: the entry decision tree runs and the person lands somewhere
 * specific (cross-cutting §4.2) — exactly as before SYS-6. `homeRoute()` is
 * unchanged and no new route exists.
 *
 * SIGNED OUT: the landing page, the product's one marketing surface (SYS-6,
 * `docs/ux/landing-page-ux.md`). `resolveEntryForRequest` returns null when
 * there is no session, which used to mean "send them to sign in"; a person who
 * typed the domain has not asked to sign in, and now sees what the thing is.
 *
 * The page reads cookies through the entry tree, so it renders dynamically and
 * a signed-in person is never served a cached landing.
 */
export const metadata: Metadata = {
  title: LANDING_COPY.meta.title,
  description: LANDING_COPY.meta.description,
  openGraph: {
    type: "website",
    siteName: LANDING_COPY.meta.siteName,
    title: LANDING_COPY.meta.title,
    description: LANDING_COPY.meta.description,
  },
  twitter: {
    card: "summary",
    title: LANDING_COPY.meta.title,
    description: LANDING_COPY.meta.description,
  },
};

export default async function RootPage() {
  const destination = await resolveEntryForRequest();
  if (destination !== null) {
    redirect(destination);
  }

  return <LandingPage />;
}
