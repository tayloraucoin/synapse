import { Heading, Text, ThemeControl } from "@syn/ui";

import { getServerApi } from "@/lib/trpc/server";

/**
 * ST-09 Appearance — and the foundation's end-to-end smoke test.
 *
 * This is the first page that reads a real row: signed-in request → the shell
 * gate → the server caller → `protectedProcedure` → `ctx.rls.execute()` →
 * Postgres with `app.user_id` set and the `authenticated` role → the caller's
 * own row and no one else's. If this renders a name, the whole rail works.
 *
 * `ThemeControl` writes to `localStorage` through next-themes and does NOT yet
 * persist to `users.theme` — Epic 1's ST-09 ticket wires the mutation. The
 * row's `theme` is shown here so the difference is visible rather than assumed.
 */
export default async function SettingsAppearancePage() {
  const api = await getServerApi();
  const me = await api.user.me();

  return (
    <div className="flex flex-col gap-(--space-5) p-(--space-4)">
      <Heading>ST-09 Appearance</Heading>

      <ThemeControl />

      <Text as="p" variant="caption" tone="muted">
        Signed in as {me.displayName ?? me.email ?? me.id} · stored theme:{" "}
        {me.theme} · zone: {me.timezone}
      </Text>
    </div>
  );
}
