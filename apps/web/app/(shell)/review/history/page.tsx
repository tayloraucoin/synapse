import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — HS-01 History. 
 *
 * Replaced by the Epic 3 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function ReviewHistoryPage() {
  return (
    <>
      <Heading>HS-01 History</Heading>
      <Text as="p" tone="secondary">
        Past weeks and days.
      </Text>
    </>
  );
}
