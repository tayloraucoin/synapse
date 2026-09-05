import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — AU-04 Forgot password. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function ForgotPage() {
  return (
    <>
      <Heading>AU-04 Forgot password</Heading>
      <Text as="p" tone="secondary">
        Send a reset link.
      </Text>
    </>
  );
}
