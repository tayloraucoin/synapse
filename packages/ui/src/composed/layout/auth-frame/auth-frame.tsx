/**
 * AuthFrame — the one skeleton for AU-01…05 (v2 handoff §8.2).
 *
 * Adapted from CC's `AuthCapturePanel` skeleton only — wordmark, heading,
 * form, footer links — with CC's Supabase wiring and copy removed. Five auth
 * screens share it so they cannot drift into five layouts.
 *
 * THE WORDMARK IS TEXT, NOT A LOGO (official spec §9.8). Synapse's mark is its
 * name set in the interface family; an image here would be the only asset on
 * the critical path of a sign-in.
 *
 * `max-w-sm`, centred on wide and full-width on compact. The trust line is a
 * prop rather than always-on because AU-03…05 are mid-flow screens where the
 * promise has already been made.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { TrustLine } from "../../display/trust-line";

export interface AuthFrameProps {
  heading: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  trustLine?: boolean;
  /** Phase 2 — writes are blocked and the form says so. */
  offline?: boolean;
  className?: string;
}

export function AuthFrame({
  heading,
  lead,
  children,
  footer,
  trustLine = false,
  offline = false,
  className,
}: AuthFrameProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col gap-(--space-5)",
        "px-(--space-4) py-(--space-6)",
        className,
      )}
    >
      <Text as="span" variant="body" weight={500}>
        Synapse
      </Text>

      <div className="flex flex-col gap-(--space-2)">
        <Text as="h1" variant="heading" weight={600}>
          {heading}
        </Text>
        {lead === undefined ? null : (
          <Text as="p" variant="secondary" tone="secondary">
            {lead}
          </Text>
        )}
      </div>

      <div
        aria-busy={offline || undefined}
        className="flex flex-col gap-(--space-4)"
      >
        {children}
      </div>

      {footer === undefined ? null : (
        <div className="flex flex-col gap-(--space-2)">{footer}</div>
      )}

      {trustLine ? <TrustLine /> : null}
    </div>
  );
}
