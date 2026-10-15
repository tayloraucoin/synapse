"use client";

import { Button, cn, Kbd, Text } from "@syn/ui";

/**
 * The desk's Next strip (USE-57; Today's index, layout 2): "NEXT", the
 * emoji, the title, the tier word and **Go ↵**, which goes to Next as Enter
 * does (D-USE-62). Desk-only: the phone never has it (D-USE-51). It repeats
 * `resolveWorkNext`'s answer and decides nothing. Props only.
 */
export interface WorkNextStripProps {
  /** "NEXT". */
  label: string;
  emoji: string | null;
  title: string;
  /** "Primary". */
  tierWord: string;
  /** "Go". */
  go: string;
  /** "Go to Next, <title>". */
  goName: string;
  onGo?: () => void;
  className?: string;
}

export function WorkNextStrip({
  label,
  emoji,
  title,
  tierWord,
  go,
  goName,
  onGo,
  className,
}: WorkNextStripProps) {
  return (
    <div
      data-work-next-strip
      className={cn(
        "border-border flex min-h-10 items-center gap-(--space-3) rounded-(--radius-control) border ps-(--space-3) pe-(--space-1)",
        className,
      )}
    >
      <Text
        as="span"
        variant="caption"
        weight={600}
        tone="muted"
        className="shrink-0 tracking-widest uppercase"
      >
        {label}
      </Text>
      <span className="flex min-w-0 flex-1 items-center gap-1.75">
        {emoji ? (
          <span
            aria-hidden="true"
            className="font-emoji inline-flex w-4.5 shrink-0 justify-center leading-none"
          >
            {emoji}
          </span>
        ) : null}
        <Text as="span" variant="secondary" truncate className="min-w-0">
          {title}
        </Text>
      </span>
      <Text as="span" variant="caption" tone="muted" className="shrink-0">
        {tierWord}
      </Text>
      <Button
        variant="ghost"
        size="sm"
        aria-label={goName}
        onClick={onGo}
        className="bg-fill-muted hover:bg-fill-muted h-8 gap-(--space-1) px-(--space-2)"
      >
        {go}
        <Kbd aria-hidden="true" className="bg-transparent">
          ↵
        </Kbd>
      </Button>
    </div>
  );
}
