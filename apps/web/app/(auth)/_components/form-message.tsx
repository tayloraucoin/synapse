"use client";

import Link from "next/link";

import { Text } from "@syn/ui";

/**
 * The one form-level line every auth screen shows: an error, an offline
 * notice, or a notice carried in from another screen.
 *
 * WHERE IT RENDERS IS WHERE IT IS READ. Under the form, before the footer —
 * not visually above the primary with a DOM order that disagrees. A person
 * using a screen reader meets it in the same place a sighted person does.
 *
 * NEVER RED (official spec §9.3). The sentence is the whole message; the
 * product's error state is words, not a colour, and colour never carries a
 * distinction alone.
 *
 * `aria-live="polite"` plus `role="alert"`: the line announces when it appears
 * without interrupting what the person is doing. It is rendered conditionally,
 * so appearing IS the change that gets announced.
 */
export interface FormMessageProps {
  children: React.ReactNode;
  /** An inline next step — *Resend the link*, *Sign in instead*. */
  action?:
    | { label: string; href: string }
    | { label: string; onClick: () => void };
}

export function FormMessage({ children, action }: FormMessageProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col gap-(--space-1)"
    >
      <Text as="p" variant="secondary">
        {children}
      </Text>

      {action === undefined ? null : "href" in action ? (
        <Link
          href={action.href}
          className="self-start font-medium text-ink underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          className="min-h-(--target) self-start text-left font-medium text-ink underline underline-offset-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
