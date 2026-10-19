"use client";

import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  ResponsiveSheet,
  SegmentedControl,
  Text,
} from "@syn/ui";
import { ROOM_COPY as COPY } from "./copy";

/**
 * The parts Make room and A later start share (USE-41; make-room/states/
 * sheet.md, later-start/states/): × on the leading edge with the scope line
 * (caption, muted) and the title beside it, an optional line under them,
 * the two-way segment, the body, and a foot line over two buttons side by
 * side, the outlined one first and the ink primary filling the rest. A
 * bottom sheet at 402; at the desk `ResponsiveSheet`'s right panel at
 * `--sheet-w` (D-USE-39).
 *
 * The frame shows what it is given: every figure in the foot line is the
 * engine's, worded by the caller.
 */
export interface RoomSheetFrameProps<T extends string> {
  open: boolean;
  /** × and every other way out: nothing written. */
  onClose: () => void;
  scope: string;
  title: string;
  line?: string;
  segment: {
    label: string;
    value: T;
    options: readonly { value: T; label: string }[];
    onChange: (value: T) => void;
    /** Make room's pick is raised; A later start's is outlined in ink, as drawn. */
    picked: "raised" | "outlined";
  };
  foot: React.ReactNode;
  /** Make room's two buttons share the row; Not now takes its own width. */
  secondary: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    even?: boolean;
  };
  primary: { label: string; onClick: () => void; disabled?: boolean };
  children: React.ReactNode;
}

export function RoomSheetFrame<T extends string>({
  open,
  onClose,
  scope,
  title,
  line,
  segment,
  foot,
  secondary,
  primary,
  children,
}: RoomSheetFrameProps<T>) {
  const header = (
    <div className="flex min-w-0 flex-1 items-start gap-(--space-2)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={onClose}
        className="-ms-(--space-3) mt-(--space-1) shrink-0"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text as="p" variant="caption" tone="muted">
          {scope}
        </Text>
        <Text as="h2" variant="heading">
          {title}
        </Text>
        {line ? (
          <Text as="p" tone="muted">
            {line}
          </Text>
        ) : null}
      </div>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
      header={header}
      // × is in the header: no second close.
      headerAction={null}
      size="tall"
      classes={{ header: "pt-(--space-2)", body: "pt-(--space-2)" }}
      footer={
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" variant="secondary" weight={500} aria-live="polite">
            {foot}
          </Text>
          <div className="flex gap-(--space-3)">
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "shrink-0 px-(--space-4)",
                secondary.even && "flex-1",
              )}
              disabled={secondary.disabled}
              onClick={secondary.onClick}
            >
              {secondary.label}
            </Button>
            <Button
              size="lg"
              className="flex-1 font-semibold"
              disabled={primary.disabled}
              onClick={primary.onClick}
            >
              {primary.label}
            </Button>
          </div>
        </div>
      }
    >
      <SegmentedControl<T>
        label={segment.label}
        value={segment.value}
        onChange={segment.onChange}
        stacked={false}
        options={segment.options}
        classes={{
          root: "gap-0",
          label: "sr-only",
          group:
            "w-full gap-1 rounded-(--radius-control) border-0 bg-fill-muted p-1",
          item: cn(
            "h-9 flex-1 rounded-(--radius-control) bg-transparent text-muted-foreground hover:bg-transparent has-checked:bg-background has-checked:text-ink motion-reduce:transition-none",
            segment.picked === "outlined"
              ? "has-checked:ring-1 has-checked:ring-ink has-checked:ring-inset"
              : "has-checked:font-semibold",
          ),
        }}
      />
      <div className="pt-(--space-3)">{children}</div>
    </ResponsiveSheet>
  );
}
