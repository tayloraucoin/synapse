"use client";

import * as React from "react";

/**
 * `Cmd/Ctrl+Enter` submits from a textarea — cross-cutting §3.3.
 *
 * WHY A MODIFIER HERE AND NOWHERE ELSE. In a single-line field `Enter` submits
 * because that is the browser's own behaviour and every form on the web works
 * that way. In a textarea `Enter` is a newline, and taking it would make it
 * impossible to write a second line — so the submit gesture moves to the
 * modifier, which is what every editor a person already uses does.
 *
 * IT IS OPT-IN, PER FORM. Only the sheets with a textarea want it, and a
 * global handler would fire inside surfaces that autosave and have no submit at
 * all (IT-01's note saves on close — there is nothing to submit).
 *
 * `requestSubmit`, NOT `submit`. `submit()` bypasses validation and the form's
 * own `onSubmit`; `requestSubmit()` behaves exactly as pressing the primary
 * would, which is the point — the shortcut must not be a second, laxer path to
 * the same write.
 */
export function useSubmitShortcut(
  formRef: React.RefObject<HTMLFormElement | null>,
  enabled = true,
): void {
  React.useEffect(() => {
    const form = formRef.current;
    if (!enabled || form === null) return;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Enter") return;
      if (!event.metaKey && !event.ctrlKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      // Only from a textarea; a single-line field already submits on Enter.
      if (target.closest("textarea") === null) return;

      event.preventDefault();
      form?.requestSubmit();
    }

    form.addEventListener("keydown", onKeyDown);
    return () => form.removeEventListener("keydown", onKeyDown);
  }, [formRef, enabled]);
}
