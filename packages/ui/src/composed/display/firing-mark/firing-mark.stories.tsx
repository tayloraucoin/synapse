import type { Meta, StoryObj } from "@storybook/react";
import { FiringMark } from "./firing-mark";

/**
 * The one mark that moves. Check it twice: with motion allowed it breathes
 * 1 → 0.35 → 1 over 2.4s; with the OS set to reduce motion it is still and at
 * full strength — never dim. USE's form (D-USE-49): the clay dot still, the
 * grey halo breathing.
 */
const meta: Meta<typeof FiringMark> = {
  title: "Composed/Display/FiringMark",
  component: FiringMark,
  args: { breathing: true },
};

export default meta;

type Story = StoryObj<typeof FiringMark>;

export const Breathing: Story = {};

export const Still: Story = { args: { breathing: false } };

export const HaloBreathing: Story = { args: { breathing: true, halo: true } };

export const HaloStill: Story = { args: { breathing: false, halo: true } };
