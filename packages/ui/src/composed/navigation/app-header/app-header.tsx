/**
 * AppHeader — title, context, back, avatar, save status (v2 handoff §5.2).
 *
 * Built new: CC's `AppTopBar` is a wordmark bar and its `PageHeader` is a
 * title stack for page bodies; neither carries back, avatar, or a save word.
 *
 * THE SCREEN'S ONE `h1`. Every route renders exactly one AppHeader and the
 * title is its `h1` (cross-cutting §3.4). That is why `title` is a node and
 * not a slot — a header that could contain a heading would let a screen grow
 * a second one.
 *
 * NO BORDER. Rhythm separates the header from the content, not a rule
 * (official spec §9.2). A hairline here would read as a toolbar.
 *
 * AVATAR TAKES A NAME, NOT INITIALS — a divergence from the handoff's
 * `{ initials, imageUrl }`. `Avatar` already owns `getInitials`, so passing
 * pre-computed initials would derive them twice and let the two results
 * disagree. The caller passes the display name; the primitive decides how it
 * shortens.
 */
"use client";

import type { SaveStatus } from "@syn/types";
import { ArrowLeft } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Avatar } from "../../../primitives/display/avatar";
import { Text } from "../../../primitives/typography/text";
import { SaveStatusText } from "../../feedback/save-status";

export interface AppHeaderClasses {
  root?: string;
  title?: string;
  subtitle?: string;
  actions?: string;
}

export interface AppHeaderProps {
  /** The screen's single `h1`. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  action?: { label: string; onClick: () => void; busy?: boolean };
  saveStatus?: SaveStatus;
  /** "Thursday 3 Sept" plus a Today action, in record and plan modes. */
  dateContext?: { label: string; onToday?: () => void };
  /** "times in Vancouver" — shown only while the day's zone differs. */
  zoneLabel?: string;
  avatar?: { name: string; imageUrl: string | null; onOpen: () => void };
  classes?: AppHeaderClasses;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  action,
  saveStatus,
  dateContext,
  zoneLabel,
  avatar,
  classes,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "bg-paper flex min-h-(--header-h) w-full items-center gap-(--space-3)",
        "px-(--space-4) py-(--space-2)",
        className,
        classes?.root,
      )}
    >
      {onBack === undefined ? null : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={backLabel}
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-baseline gap-(--space-3)">
          <Text
            as="h1"
            variant="heading"
            weight={600}
            truncate
            className={classes?.title}
          >
            {title}
          </Text>
          {saveStatus === undefined ? null : (
            <SaveStatusText status={saveStatus} />
          )}
        </div>

        {subtitle === undefined && dateContext === undefined && zoneLabel === undefined ? null : (
          <div className="flex min-w-0 flex-wrap items-center gap-(--space-2)">
            {subtitle === undefined ? null : (
              <Text
                as="span"
                variant="secondary"
                tone="secondary"
                className={classes?.subtitle}
              >
                {subtitle}
              </Text>
            )}
            {dateContext === undefined ? null : (
              <>
                <Text as="span" variant="secondary" tone="secondary">
                  {dateContext.label}
                </Text>
                {dateContext.onToday === undefined ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dateContext.onToday}
                  >
                    Today
                  </Button>
                )}
              </>
            )}
            {zoneLabel === undefined ? null : (
              <Text as="span" variant="caption" tone="secondary">
                {zoneLabel}
              </Text>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-(--space-2)",
          classes?.actions,
        )}
      >
        {action === undefined ? null : (
          <Button variant="ghost" busy={action.busy} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {avatar === undefined ? null : (
          <button
            type="button"
            aria-label="Settings"
            onClick={avatar.onOpen}
            className={cn(
              "inline-flex size-(--target) items-center justify-center rounded-(--radius-full)",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            <Avatar src={avatar.imageUrl} name={avatar.name} label="Settings" />
          </button>
        )}
      </div>
    </header>
  );
}
