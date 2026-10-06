/**
 * The committing face — UX v1.2 §2 guardrail 4, TD-18 (RUN-7).
 *
 * A control whose write is in flight shows a HAIRLINE PULSE: its edge breathes
 * in `edge`, nothing spins, nothing greys, nothing goes red. The control
 * stays exactly as usable as it was — the person's next tap is the next
 * value, never a wait. Under reduced motion the edge simply holds the darker
 * step.
 *
 * One string, so the steppers and `SelectRow` breathe the same way.
 */
export const COMMITTING_PULSE = "border-edge motion-safe:animate-pulse";
