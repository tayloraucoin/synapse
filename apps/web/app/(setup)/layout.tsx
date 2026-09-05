import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { requireVerifiedEmail } from "@/lib/auth/require-verified-email";
import { signInRoute } from "@/lib/routes";

/**
 * The setup group — no shell, a sequence (Epic 1 §0.4, FR-01…05).
 *
 * Gates on a verified session and nothing else. It deliberately does NOT run
 * the entry tree: this IS where the entry tree sends someone, and a gate that
 * re-ran it here would redirect the sequence to itself.
 */
export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getRequestUser();
  if (!user) {
    redirect(signInRoute());
  }
  requireVerifiedEmail(user);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen-safe w-full max-w-(--content-text) flex-col gap-(--space-5) p-(--space-4)"
    >
      {children}
    </main>
  );
}
