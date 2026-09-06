"use client";

import * as React from "react";

import { Button, GroupHeading, StatusLine, Text, TypedConfirmDialog } from "@syn/ui";
import { DELETE_CONFIRMATION_WORD } from "@syn/validators";

import { AUTH_NOTICE } from "@/app/(auth)/_components/copy";
import { useOnline } from "@/lib/hooks/use-online";
import { logoutRoute, signInRoute, withNotice } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { DATA_COPY as COPY } from "./copy";

/**
 * ST-10a — the one destructive action in the product.
 *
 * NOT ADJACENT TO *Export everything* (Epic 1 §0.3). The two sections are
 * separated by rhythm and a hairline, and this trigger is text-weight rather
 * than a filled button: the destructive token appears exactly once, on the
 * dialog's confirm, which `TypedConfirmDialog` applies itself. No file in this
 * app names that button variant — the grep in SET-10's acceptance criteria is
 * what keeps it that way.
 *
 * THE SESSION IS ENDED BY POSTING TO `/logout`. A tRPC mutation cannot clear
 * cookies through the fetch adapter, and a browser still holding `sb-*` cookies
 * for an account that no longer exists is a browser that will spend the next
 * hour trying to refresh a token for a deleted user. `/logout` succeeds either
 * way — it revokes what it can and clears the cookies regardless — so it is
 * safe to call after the account is already gone.
 *
 * `window.location` RATHER THAN `router.push`. The client cache is full of a
 * deleted person's data; a soft navigation would carry it to the sign-in
 * screen. A document load is the only honest way to leave.
 */
export function DeleteSection() {
  const online = useOnline();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const remove = trpc.user.deleteAccount.useMutation();

  async function confirm(): Promise<void> {
    setError(null);
    try {
      await remove.mutateAsync({ confirmation: DELETE_CONFIRMATION_WORD });
    } catch {
      setError(COPY.deleteFailed);
      return;
    }

    try {
      await fetch(logoutRoute(), { method: "POST" });
    } catch {
      // The account is already gone; a failed sign-out must not strand the
      // person on a screen for an account that no longer exists.
    }

    window.location.href = withNotice(
      signInRoute(),
      AUTH_NOTICE.accountDeleted,
    );
  }

  return (
    <section className="flex flex-col gap-(--space-2) border-hairline border-t pt-(--space-6)">
      <GroupHeading>{COPY.deleteHeading}</GroupHeading>

      <Text as="p" tone="secondary" className="max-w-(--measure)">
        {COPY.deleteBody}
      </Text>

      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <div className="pt-(--space-1)">
        <Button
          ref={triggerRef}
          variant="ghost"
          disabled={!online}
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          {COPY.deleteAction}
        </Button>
      </div>

      <TypedConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // Focus returns to the trigger on cancel (SET-10's accessibility
          // note). Radix restores it for us; this is the belt for the case
          // where the dialog is closed programmatically.
          if (!next) triggerRef.current?.focus();
        }}
        title={COPY.deleteTitle}
        description={
          <>
            Type <strong>{COPY.deleteWord}</strong> to confirm. Everything is
            removed straight away.
            {error === null ? null : (
              <>
                <br />
                {error}
              </>
            )}
          </>
        }
        word={COPY.deleteWord}
        inputLabel={COPY.deleteConfirmLabel}
        confirmLabel={COPY.deleteConfirmAction}
        cancelLabel={COPY.cancel}
        busy={remove.isPending}
        onConfirm={() => void confirm()}
      />
    </section>
  );
}
