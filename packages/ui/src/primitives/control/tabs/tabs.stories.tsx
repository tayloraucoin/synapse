import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Control/Tabs",
  component: Tabs,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Tabs defaultValue="today" className="max-w-md p-(--space-6)">
      <TabsList>
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This week</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="today">9 of 12 done · 2 moved</TabsContent>
      <TabsContent value="week">4 of 7 days reviewed</TabsContent>
      <TabsContent value="history">Past weeks and days</TabsContent>
    </Tabs>
  ),
};
