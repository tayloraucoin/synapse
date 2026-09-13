import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { BudgetLine } from "./budget-line";

const meta: Meta<typeof BudgetLine> = {
  title: "Composed/Display/BudgetLine",
  component: BudgetLine,
};

export default meta;

type Story = StoryObj<typeof BudgetLine>;

export const Under: Story = { args: { chosenMin: 68, availableMin: 72 } };
export const Exact: Story = { args: { chosenMin: 72, availableMin: 72 } };
export const Over: Story = { args: { chosenMin: 83, availableMin: 72 } };

/** The three side by side: identical but for the numbers (§5.3, §10.2). */
export const ThreeStates: StoryObj = {
  render: () => (
    <div className="flex flex-col">
      <BudgetLine chosenMin={68} availableMin={72} />
      <BudgetLine chosenMin={72} availableMin={72} />
      <BudgetLine chosenMin={83} availableMin={72} />
    </div>
  ),
};

/** Three quick taps announce once — the live region lags by 500 ms (§10.4). */
export const Debounced: StoryObj = {
  render: function Render() {
    const [chosen, setChosen] = React.useState(53);
    return (
      <div className="flex flex-col gap-(--space-3)">
        <BudgetLine chosenMin={chosen} availableMin={72} sticky />
        <div className="flex gap-(--space-2)">
          <Button variant="secondary" size="sm" onClick={() => setChosen((n) => n + 15)}>
            Tick one (+15)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setChosen((n) => Math.max(0, n - 15))}>
            Untick one
          </Button>
        </div>
      </div>
    );
  },
};
