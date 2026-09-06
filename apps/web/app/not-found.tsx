"use client";

import { useRouter } from "next/navigation";

import { ErrorPage } from "@syn/ui";

import { todayRoute } from "@/lib/routes";

/**
 * SY-05 — route not found (cross-cutting §10).
 *
 * THE COPY LIVES IN THE COMPOSITE, not here. INF-7 wrote these two sentences in
 * plain markup so the page existed from day one; SYS-3 moves them into
 * `ErrorPage`, which is where the other variant's copy already was — one home
 * for the two error screens means the pair cannot drift into different voices.
 *
 * `main#main` STAYS HERE. `ScreenFrame` is a `div`, and the skip link in every
 * other frame targets `#main` — an error page without it is a page whose skip
 * link points at nothing, on exactly the screen where a person is most likely
 * to be navigating by keyboard because something is wrong.
 *
 * Never a stack trace, never an error code in the copy. The code is logged; the
 * person gets a sentence and a door.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-sm flex-col justify-center"
    >
      <ErrorPage
        variant="not-found"
        onOpenToday={() => router.push(todayRoute())}
      />
    </main>
  );
}
