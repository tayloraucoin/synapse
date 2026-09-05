import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";

/**
 * Placeholder — FR-01…05, the first-run sequence.
 *
 * Five steps, and the segment is validated: `/setup/6` is not a step, and a
 * sequence that renders an empty sixth screen is worse than a 404.
 */
const STEPS: Record<string, { id: string; description: string }> = {
  "1": { id: "FR-01 Your day", description: "Wake time, day close time, time zone." },
  "2": { id: "FR-02 Habits", description: "The first few things worth tracking." },
  "3": { id: "FR-03 A first template", description: "One named day plan." },
  "4": { id: "FR-04 This week", description: "Apply it to the days that fit." },
  "5": { id: "FR-05 Ready", description: "That's the setup. Everything else is editable later." },
};

export default async function SetupStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const entry = STEPS[step];
  if (!entry) notFound();

  return (
    <>
      <Heading>{entry.id}</Heading>
      <Text as="p" tone="secondary">{entry.description}</Text>
    </>
  );
}
