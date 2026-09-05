import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — AU-05 Reset password. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function ResetPage() {
  return (
    <>
      <Heading>AU-05 Reset password</Heading>
      <Text as="p" tone="secondary">
        Set a new password; the session is already established by /auth/confirm.
      </Text>
    </>
  );
}
