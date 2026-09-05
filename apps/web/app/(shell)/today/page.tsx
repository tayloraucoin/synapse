import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — LS-01 Plain List. 
 *
 * Replaced by the Epic 2 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function TodayPage() {
  return (
    <>
      <Heading>LS-01 Plain List</Heading>
      <Text as="p" tone="secondary">
        Today, top to bottom, in time order.
      </Text>
    </>
  );
}
