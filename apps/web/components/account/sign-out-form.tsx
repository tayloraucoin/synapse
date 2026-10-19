"use client";

/**
 * SignOutForm — Settings' Sign out (AU-06; USE-106). Before it posts to the
 * logout route it empties the device: the persisted cache and the writes
 * still waiting offline (`lib/offline/clear.ts`). A failed clear never keeps
 * anyone signed in: the post goes either way.
 */
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@syn/ui";
import { beginDeliberateSignOut } from "@/lib/auth/session-expired";
import { clearOfflineStore } from "@/lib/offline/clear";
import { persister } from "@/lib/offline/persister";
import { logoutRoute } from "@/lib/routes";

interface SignOutFormProps {
  label: string;
  className: string;
}

export function SignOutForm({ label, className }: SignOutFormProps) {
  const queryClient = useQueryClient();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    beginDeliberateSignOut();
    await clearOfflineStore(queryClient, persister).catch(() => undefined);
    form.submit();
  }

  return (
    <form action={logoutRoute()} method="post" onSubmit={onSubmit}>
      <button type="submit" className={className}>
        <Text as="span" variant="body">
          {label}
        </Text>
      </button>
    </form>
  );
}
