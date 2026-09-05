import { Text } from "@syn/ui";

/**
 * The *or* between the Google button and the email form (AU-01, AU-02).
 *
 * The word is the divider; the rules on either side are decoration and are
 * hidden from the accessibility tree, so a screen reader hears "or" once
 * rather than meeting two anonymous separators around it.
 */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-(--space-3)">
      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
      <Text as="span" variant="secondary" tone="secondary">
        {label}
      </Text>
      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
    </div>
  );
}
