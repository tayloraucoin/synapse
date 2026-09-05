import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Primitives/Control/Button",
  component: Button,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Button>;

const VARIANTS = ["default", "secondary", "ghost", "destructive"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col gap-(--space-5) p-(--space-6)">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-(--space-2)">
          <p className="text-text-muted m-0 font-sans text-(length:--fs-caption)">
            {variant}
          </p>
          <div className="flex flex-wrap items-center gap-(--space-3)">
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                Finish review
              </Button>
            ))}
            <Button variant={variant} size="icon" aria-label="More">
              +
            </Button>
            <Button variant={variant} busy>
              Finish review
            </Button>
            <Button variant={variant} disabled>
              Finish review
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Busy: Story = {
  args: { busy: true, children: "Finish review" },
};

/** `size="icon"` requires an aria-label — an icon never stands alone (§9.9). */
export const IconOnly: Story = {
  args: { size: "icon", "aria-label": "Add a one-off", children: "+" },
};
