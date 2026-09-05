import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — SY-01 About & feedback. 
 *
 * Replaced by the cross-cutting track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function SettingsAboutPage() {
  return (
    <>
      <Heading>SY-01 About & feedback</Heading>
      <Text as="p" tone="secondary">
        Version, feedback, keyboard shortcuts, legal.
      </Text>
    </>
  );
}
