import type { Metadata } from "next";
import { WELCOME_COPY, WelcomeFrame } from "./_components";

export const metadata: Metadata = { title: WELCOME_COPY.pageTitle };

/**
 * `/today/ready`: the Ready, go welcome (USE-43; interactions/ready-go/,
 * D-USE-71), on fixtures through `useToday` until the day-records wiring.
 * Between Review the day and Now: the day as set, and one button that
 * starts the block in hand.
 *
 * Focused at every width (`isFocusedPath`): no header, no rail, no tabs, no
 * avatar. The entry tree sends a reopen before Start here, and one after it
 * on to Now.
 */
export default function WelcomePage() {
  return <WelcomeFrame />;
}
