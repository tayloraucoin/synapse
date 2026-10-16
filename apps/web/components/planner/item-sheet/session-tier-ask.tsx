"use client";

import * as React from "react";
import { Button, RadioGroup, RadioGroupItem, Text } from "@syn/ui";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.sessions.ask;

export type SessionsChoice = "this" | "all";

/**
 * SessionTierAsk — a session's tier change asks first (USE-67;
 * interactions/sessions.md step 4, C-USE-sessions-2, D-USE-57): "Move to
 * Primary", "<title> has three sessions: Mon 12, Wed 14, Thu 15.", This
 * session ("Mon 12 only", selected each time) or All sessions with where
 * each other session would end, in words and never red, then Move. The
 * radios are one group named by the heading; Move is the form's default,
 * so Enter moves. A step inside the Item sheet, so no second sheet stacks;
 * closing it writes nothing. Props only.
 */
export interface SessionTierAskProps {
  /** "Move to Primary". */
  title: string;
  lead: string;
  /** "Mon 12 only". */
  thisLine: string;
  /** "Wed's ends 12:10 at the top of its ranges". */
  allLine: string;
  headingRef: React.Ref<HTMLHeadingElement>;
  onMove: (choice: SessionsChoice) => void;
}

export function SessionTierAsk({
  title,
  lead,
  thisLine,
  allLine,
  headingRef,
  onMove,
}: SessionTierAskProps) {
  const ids = {
    heading: React.useId(),
    this: React.useId(),
    all: React.useId(),
  };
  const [choice, setChoice] = React.useState<SessionsChoice>("this");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onMove(choice);
      }}
      className="flex flex-col gap-(--space-3)"
    >
      <div className="flex flex-col gap-(--space-1)">
        <Text
          ref={headingRef}
          as="h2"
          id={ids.heading}
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {title}
        </Text>
        <Text as="p" variant="secondary" tone="secondary">
          {lead}
        </Text>
      </div>
      <RadioGroup
        aria-labelledby={ids.heading}
        value={choice}
        onValueChange={(value) => setChoice(value as SessionsChoice)}
        className="divide-hairline border-hairline flex flex-col gap-0 divide-y border-b"
      >
        {(
          [
            ["this", COPY.thisSession, thisLine],
            ["all", COPY.allSessions, allLine],
          ] as const
        ).map(([value, word, line]) => (
          <label
            key={value}
            className="flex min-h-14 cursor-pointer items-start gap-(--space-3) py-(--space-3)"
          >
            <RadioGroupItem
              value={value}
              aria-describedby={ids[value]}
              className="mt-1 size-5 rounded-full [&_span]:rounded-full"
            />
            <span className="flex min-w-0 flex-col">
              <Text as="span" variant="body" weight={500}>
                {word}
              </Text>
              <Text
                as="span"
                id={ids[value]}
                variant="secondary"
                tone="secondary"
              >
                {line}
              </Text>
            </span>
          </label>
        ))}
      </RadioGroup>
      <Button type="submit" size="lg" className="w-full">
        {COPY.move}
      </Button>
    </form>
  );
}
