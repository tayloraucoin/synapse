import { sql } from "drizzle-orm";
import type { Db } from "../client";
import { resolveDbEnvironment } from "../connection-env";

export type EnsureLocalUserFromSupabaseAuthInput = {
  supabaseUid: string;
  email: string | null | undefined;
  phone?: string | null;
};

/**
 * Local dev only: insert a stub auth.users row so public.users FK + handle_new_user() resolve.
 * On Supabase-hosted Postgres this is a no-op when the row already exists (signup trigger).
 */
export async function ensureLocalUserFromSupabaseAuth(
  db: Db,
  input: EnsureLocalUserFromSupabaseAuthInput,
): Promise<void> {
  if (resolveDbEnvironment() !== "local") {
    return;
  }

  const email = input.email?.trim() || null;
  const phone = input.phone?.trim() || null;

  await db.execute(sql`
    INSERT INTO auth.users (id, email, phone)
    VALUES (${input.supabaseUid}::uuid, ${email}, ${phone})
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, auth.users.email),
      phone = COALESCE(EXCLUDED.phone, auth.users.phone)
  `);
}
