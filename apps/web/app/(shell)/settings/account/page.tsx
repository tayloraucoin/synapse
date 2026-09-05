import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — ST-01 Account. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function SettingsAccountPage() {
  return (
    <>
      <Heading>ST-01 Account</Heading>
      <Text as="p" tone="secondary">
        Name, email, avatar, sign out.
      </Text>
    </>
  );
}
