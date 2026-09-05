import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { AppHeader } from "./app-header";

/**
 * The screen's one `h1` (cross-cutting §3.4), which is why `title` is a node
 * and not a slot — a header that could contain a heading would let a screen
 * grow a second one. No border: rhythm separates it from the content.
 */
const meta: Meta<typeof AppHeader> = {
  title: "Composed/Navigation/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof AppHeader>;

export const Plain: Story = { args: { title: "Today" } };

export const WithAvatar: Story = {
  args: {
    title: "Today",
    avatar: { name: "Taylor Aucoin", imageUrl: null, onOpen: () => {} },
  },
};

export const WithBack: Story = {
  args: { title: "Morning run", onBack: () => {} },
};

/** A canvas: the save word sits beside the title, never as a colour. */
export const WithSaveStatus: Story = {
  args: { title: "Weekday morning", saveStatus: "saving" },
};

export const SaveFailed: Story = {
  args: { title: "Weekday morning", saveStatus: "failed" },
};

/** Record and plan modes carry the date and a way back to today. */
export const DateContext: Story = {
  args: {
    title: "List",
    dateContext: { label: "Thursday 3 Sept", onToday: () => {} },
    zoneLabel: "times in Vancouver",
  },
};

export const WithAction: Story = {
  args: {
    title: "New habit",
    onBack: () => {},
    action: { label: "Save", onClick: () => {}, busy: false },
  },
};
