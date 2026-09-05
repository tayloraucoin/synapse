import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — AU-01 Sign in. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function SignInPage() {
  return (
    <>
      <Heading>AU-01 Sign in</Heading>
      <Text as="p" tone="secondary">
        Google first, then email and password.
      </Text>
    </>
  );
}
