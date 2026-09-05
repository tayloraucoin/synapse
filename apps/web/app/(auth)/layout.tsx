import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { homeRoute } from "@/lib/routes";

/**
 * The auth group — no shell, one centred column (Epic 1 §0.4).
 *
 * A signed-in person never sees these screens (Epic 1 AU-01: "already signed
 * in: never shown"), so the gate here is the inverse of the shell's.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getRequestUser();
  if (user) {
    redirect(homeRoute());
  }

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-sm flex-col justify-center gap-(--space-5) p-(--space-4)"
    >
      {children}
    </main>
  );
}
