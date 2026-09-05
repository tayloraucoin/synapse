import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — ST-08 Day & time. 
 *
 * Replaced by the Epic 1 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function SettingsDayPage() {
  return (
    <>
      <Heading>ST-08 Day & time</Heading>
      <Text as="p" tone="secondary">
        Time zone, day close time, review reminder.
      </Text>
    </>
  );
}
