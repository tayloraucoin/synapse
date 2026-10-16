"use client";

import * as React from "react";
import {
  BackIcon,
  BackToPoolIcon,
  Button,
  CloseIcon,
  PickADayIcon,
  Text,
  toastUndo,
} from "@syn/ui";
import type { MoveSubject, MoveTarget } from "@/lib/data/move-to";
import { useMoveTo } from "@/lib/data/use-move-to";
import { MOVE_TO_COPY as COPY } from "./copy";
import { MoveTargetRow } from "./move-target-row";
import { PickADay } from "./pick-a-day";
import { targetWords } from "./target-words";

/**
 * MoveToStep (USE-69; interactions/move-to): one item off its place today.
 * Later today, then Another day, each row naming its consequence before the
 * tap; Pick a day opens the month inside the step; a work item adds Back to
 * the pool. One tap moves, closes and offers Undo in the toast
 * (C-USE-move-to-1); nothing changes the usual week.
 *
 * From the Item sheet (`from: "sheet"`) it is a step with back on the left
 * to the item and a footer line; from the work menu (`"menu"`, D-USE-57) its
 * own sheet with × and no footer (work-move-to.md).
 */
export interface MoveToStepProps {
  /** The set item or work item, as the Item sheet's `id`. */
  itemRef: string;
  from: "sheet" | "menu";
  /** Back (the sheet) or × (the menu): nothing moved. */
  onBack: () => void;
  /** The sheet closes before the move lands, as Swap's pick does. */
  onDone: () => void;
  /** A capture's start: Pick a day open on this date. */
  seededPick?: string | null;
}

function scopeOf(subject: MoveSubject, from: "sheet" | "menu"): string {
  if (subject.type === "set") {
    return COPY.scopeSet(
      subject.title,
      subject.lengthMin,
      subject.blockName,
      subject.startsAt,
      subject.endsAt,
    );
  }
  if (from === "menu") return COPY.scopeMenu(subject.title, subject.topMin);
  return COPY.scopeWork({
    identifier: subject.identifier,
    title: subject.title,
    minMin: subject.lengthMinMin,
    maxMin: subject.lengthMaxMin,
    block: subject.blockName,
    start: subject.startsAt,
    end: subject.endsAt,
    tier: subject.tier,
  });
}

export function MoveToStep({
  itemRef,
  from,
  onBack,
  onDone,
  seededPick = null,
}: MoveToStepProps) {
  const [picking, setPicking] = React.useState(seededPick !== null);
  const [picked, setPicked] = React.useState<string | null>(seededPick);
  const moveTo = useMoveTo(itemRef, picked);
  const { view, todayKey } = moveTo;
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  // Each step focuses its title once the item is read.
  const loaded = view !== null;
  React.useEffect(() => {
    if (!loaded) return;
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [picking, loaded]);

  if (view === null) return null;
  const { subject } = view;

  async function go(target: MoveTarget, toast: string) {
    onDone();
    const written = await moveTo.move(target);
    if (written === null) return;
    toastUndo({ text: toast, onUndo: () => void moveTo.undo(written) });
  }

  const scope = (
    <Text as="p" variant="secondary" tone="secondary">
      {scopeOf(subject, from)}
    </Text>
  );

  if (picking) {
    return (
      <PickADay
        scope={scope}
        subject={subject}
        todayKey={todayKey}
        picked={picked}
        target={moveTo.picked}
        onPick={setPicked}
        onBack={() => setPicking(false)}
        onMove={(target, toast) => void go(target, toast)}
        titleRef={titleRef}
      />
    );
  }

  const row = (target: MoveTarget) => {
    const words = targetWords(target, subject, todayKey);
    return (
      <li
        key={`${target.kind}:${"blockId" in target ? target.blockId : ""}:${"dateKey" in target ? target.dateKey : ""}`}
        className="border-hairline border-b"
      >
        <MoveTargetRow
          label={words.label}
          line={words.line}
          kind={target.kind === "block" ? target.blockKind : undefined}
          icon={target.kind === "pool" ? BackToPoolIcon : undefined}
          onSelect={() => void go(target, words.toast)}
        />
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        {from === "sheet" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label={COPY.back(subject.title)}
            className="-ms-(--space-3) gap-(--space-1) self-start"
          >
            <BackIcon aria-hidden="true" className="size-4" />
            {subject.title}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={COPY.close}
            className="-ms-(--space-3) self-start"
          >
            <CloseIcon aria-hidden="true" />
          </Button>
        )}
        {scope}
        <Text
          as="h2"
          variant="heading"
          ref={titleRef}
          tabIndex={-1}
          className="outline-none"
        >
          {COPY.title}
        </Text>
      </div>

      {view.later.length === 0 ? null : (
        <section className="flex flex-col">
          <Text as="h3" variant="secondary" tone="secondary" weight={600}>
            {COPY.later}
          </Text>
          <ul className="flex flex-col">{view.later.map(row)}</ul>
        </section>
      )}

      <section className="flex flex-col">
        <Text as="h3" variant="secondary" tone="secondary" weight={600}>
          {COPY.another}
        </Text>
        <ul className="flex flex-col">
          {view.tomorrow === null ? null : row(view.tomorrow)}
          <li className="border-hairline border-b">
            <MoveTargetRow
              label={COPY.pickADay}
              icon={PickADayIcon}
              disclosure
              onSelect={() => setPicking(true)}
            />
          </li>
          {subject.type === "work" ? row({ kind: "pool" }) : null}
        </ul>
      </section>

      {from === "sheet" ? (
        <Text
          as="p"
          variant="secondary"
          tone="secondary"
          className="mt-(--space-4)"
        >
          {subject.type === "work" ? COPY.footerWork : COPY.footerSet(todayKey)}
        </Text>
      ) : null}
    </div>
  );
}
