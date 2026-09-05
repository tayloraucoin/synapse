import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — SC-01 Schedule. 
 *
 * Replaced by the Epic 2 track. The `Heading` is here from day one so every
 * page has exactly one `h1` (cross-cutting §11) before any content exists.
 */
export default function TodaySchedulePage() {
  return (
    <>
      <Heading>SC-01 Schedule</Heading>
      <Text as="p" tone="secondary">
        The day against the plan.
      </Text>
    </>
  );
}
