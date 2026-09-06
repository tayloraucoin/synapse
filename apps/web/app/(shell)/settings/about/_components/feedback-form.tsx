"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Button,
  GroupHeading,
  HelperText,
  Label,
  StatusLine,
  Switch,
  Text,
  Textarea,
} from "@syn/ui";
import { FEEDBACK_MAX } from "@syn/constants";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { ABOUT_COPY as COPY } from "./copy";

/**
 * SY-01's *Feedback* section.
 *
 * THE PATH IS TAKEN FROM `usePathname`, WHICH HAS NO QUERY STRING. That is the
 * whole reason it is used instead of `window.location.pathname`: sheet state
 * lives in the query in this app, so `?sheet=item&id=<uuid>` is where a list
 * item's id would leak from, and `usePathname` cannot return one. The validator
 * refuses a path containing `?` regardless — belt and braces, because the
 * non-negotiable here is that nothing from the list reaches the table.
 *
 * THE SWITCH DEFAULTS ON, AND THE HELPER SAYS WHAT IT DOES. Context makes a
 * report actionable, so it is offered rather than hidden; *Nothing from your
 * list is included.* is what makes leaving it on a reasonable thing to do
 * without reading the source.
 *
 * THE TYPED MESSAGE SURVIVES A FAILURE. On error the form stays exactly as it
 * was — including through SY-04's dialog opening over it, since the state lives
 * here and the dialog is a sibling — so a person who wrote three paragraphs
 * about a bug does not lose them to the bug.
 */
export function FeedbackForm() {
  const online = useOnline();
  const pathname = usePathname();
  const send = trpc.feedback.send.useMutation();

  const [message, setMessage] = React.useState("");
  const [includeContext, setIncludeContext] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  async function submit(): Promise<void> {
    if (message.trim().length === 0) {
      setError(COPY.emptyMessage);
      return;
    }
    setError(null);

    try {
      await send.mutateAsync({
        message: message.trim(),
        includeContext,
        ...(includeContext
          ? {
              screenPath: pathname,
              ...(version === undefined ? {} : { appVersion: version }),
            }
          : {}),
      });
      setSent(true);
    } catch {
      // The message stays in the field. A person who just wrote a paragraph
      // about something being broken must not lose it to something breaking.
      setError(COPY.sendFailed);
    }
  }

  return (
    <section className="flex flex-col gap-(--space-3)">
      <GroupHeading>{COPY.feedbackHeading}</GroupHeading>

      <Text as="p" tone="secondary" className="max-w-(--measure)">
        {COPY.feedbackBody}
      </Text>

      {sent ? (
        // Announced rather than merely shown: the form it replaces is gone, so
        // a screen-reader user has nothing else to notice.
        <Text as="p" role="status" tone="body">
          {COPY.sent}
        </Text>
      ) : (
        <>
          <Textarea
            label={COPY.messageLabel}
            value={message}
            maxLength={FEEDBACK_MAX}
            autoGrow
            error={error ?? undefined}
            onChange={(event) => {
              setMessage(event.target.value);
              if (error !== null) setError(null);
            }}
          />

          <div className="flex flex-col gap-(--space-2)">
            <div className="flex items-center justify-between gap-(--space-3)">
              <Label htmlFor="feedback-include-context">
                {COPY.includeContext}
              </Label>
              <Switch
                id="feedback-include-context"
                checked={includeContext}
                aria-describedby="feedback-include-context-helper"
                onCheckedChange={setIncludeContext}
              />
            </div>
            <HelperText id="feedback-include-context-helper">
              {COPY.includeContextHelper}
            </HelperText>
          </div>

          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          <div>
            <Button
              busy={send.isPending}
              disabled={!online}
              onClick={() => void submit()}
            >
              {COPY.send}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
