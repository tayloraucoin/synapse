import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — ST-09 Appearance. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function SettingsAppearancePage() {
  return (
    <>
      <Heading>ST-09 Appearance</Heading>
      <Text as="p" tone="secondary">
        System, light, or dark.
      </Text>
    </>
  );
}
