import { GroupHeading, Kbd, Text } from "@syn/ui";

import { SHORTCUTS } from "@/lib/keyboard/shortcuts";

import { ABOUT_COPY as COPY } from "./copy";

/**
 * SY-01's shortcut list — cross-cutting §3.1.
 *
 * WIDE ONLY, IN CSS RATHER THAN JAVASCRIPT. `hidden wide:block` means the
 * server renders the same markup at both widths and the browser decides — a
 * `useIsWide` here would render the table on the server, hide it after
 * hydration, and flash a list of keys at someone holding a phone.
 *
 * A REAL TABLE, WITH A CAPTION AND HEADERS. This is tabular data — keys in one
 * column, what they do in the other — and a screen-reader user navigating it by
 * column is the reason `<th>` exists. `Kbd` renders each key as `<kbd>`.
 *
 * THE LIST IS `SHORTCUTS`, WHICH SYS-4 ALSO BINDS. One array, so this page
 * cannot promise a key nothing listens for.
 */
export function ShortcutsTable() {
  return (
    <section className="hidden flex-col gap-(--space-2) wide:flex">
      <GroupHeading>{COPY.shortcutsHeading}</GroupHeading>

      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{COPY.shortcutsHeading}</caption>
        <thead>
          <tr>
            <th scope="col" className="py-(--space-2) pe-(--space-4)">
              <Text as="span" variant="caption" tone="secondary">
                {COPY.shortcutsKeys}
              </Text>
            </th>
            <th scope="col" className="py-(--space-2)">
              <Text as="span" variant="caption" tone="secondary">
                {COPY.shortcutsAction}
              </Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map((shortcut) => (
            <tr key={shortcut.label} className="border-hairline border-t">
              <td className="py-(--space-2) pe-(--space-4) align-top">
                <span className="flex flex-wrap gap-(--space-1)">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </td>
              <td className="py-(--space-2) align-top">
                <Text as="span" tone="body">
                  {shortcut.label}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
