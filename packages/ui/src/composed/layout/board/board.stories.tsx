import type { Meta, StoryObj } from "@storybook/react";
import type { WorkflowColumnView, WorkflowGroupView, WorkflowTaskView } from "@syn/types";
import * as React from "react";

import {
  HARBOR,
  INTERNAL,
  NORTHWIND,
  QUEUE_COLUMNS,
  TASK_BACK_WITH_NOTE,
  TASK_CLOSED,
  TASK_FIRING_4,
  TASK_FIRING_72,
  TASK_NEVER_FIRED,
  TASK_PLAIN,
  WORKFLOW_STORY_NOW,
  WORKING_COLUMNS,
} from "../../__fixtures__/workflow";
import { EllipsesMenu } from "../../control/ellipses-menu";
import { InlineAddRow } from "../../control/inline-add-row";
import { LANE_HEADER_COPY, LaneHeader } from "../../display/lane-header";
import { TaskRow } from "../../display/task-row";
import { Board, BoardCell, BoardLane, BoardSkeleton } from "./board";

/**
 * The static board. Check, in both themes: the only thing that moves is the
 * mark in each firing toggle (and in a folded lane's head); the next row is the
 * one surface; nothing shows a tally. At 900px the lanes scroll sideways with
 * the first column and the heads in place; at 375px one column shows.
 *
 * The stories compose the board as FLO-6 will — rows, heads and add rows from
 * their own components, never a class name for a row.
 */
const meta: Meta<typeof Board> = {
  title: "Composed/Layout/Board",
  component: Board,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Board>;

type LaneSpec = {
  group: WorkflowGroupView | null;
  tasks: WorkflowTaskView[];
  firstToday?: boolean;
  hasFiring?: boolean;
  hasNext?: boolean;
};

const NEXT_ID = TASK_BACK_WITH_NOTE.id;

function rowVariant(column: WorkflowColumnView): "active" | "plain" | "closed" {
  if (column.role === "active") return "active";
  if (column.role === "done") return "closed";
  return "plain";
}

function DemoBoard({
  columns,
  lanes,
  visibleColumnId,
}: {
  columns: WorkflowColumnView[];
  lanes: LaneSpec[];
  visibleColumnId?: string;
}) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(lanes.map((lane) => [lane.group?.id ?? "none", lane.group?.collapsed ?? false])),
  );

  return (
    <Board columns={columns} visibleColumnId={visibleColumnId}>
      {lanes.map((lane) => {
        const key = lane.group?.id ?? "none";
        const name = lane.group?.name ?? LANE_HEADER_COPY.noGroup;
        const isCollapsed = collapsed[key] ?? false;
        return (
          <BoardLane
            key={key}
            label={name}
            collapsed={isCollapsed}
            header={
              <LaneHeader
                name={name}
                hue={lane.group?.hue ?? null}
                plain={lane.group === null}
                collapsed={isCollapsed}
                onCollapsedChange={(next) => setCollapsed((state) => ({ ...state, [key]: next }))}
                firstToday={lane.firstToday}
                hasFiring={lane.hasFiring}
                hasNext={lane.hasNext}
                menu={<EllipsesMenu label={`${name} options`} items={[{ label: "Rename" }, { label: "Archive group" }]} />}
              />
            }
          >
            {columns.map((column) => (
              <BoardCell
                key={column.id}
                columnId={column.id}
                label={`${name}, ${column.name}`}
                footer={
                  <InlineAddRow
                    label="Add a task"
                    placeholder="Task"
                    maxLength={120}
                    keepOpen
                    onSubmit={() => {}}
                    visibility={column.role === "active" ? "always" : "lane-focus"}
                  />
                }
              >
                {lane.tasks
                  .filter((task) => task.columnId === column.id)
                  .map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      variant={rowVariant(column)}
                      isNext={task.id === NEXT_ID}
                      now={WORKFLOW_STORY_NOW}
                      groupName={lane.group?.name ?? null}
                      columnName={column.name}
                      onOpen={() => {}}
                      onFiringChange={column.role === "active" ? () => {} : undefined}
                      menu={<EllipsesMenu label={`${task.title} options`} items={[{ label: "Open" }, { label: "Archive" }]} />}
                    />
                  ))}
              </BoardCell>
            ))}
          </BoardLane>
        );
      })}
    </Board>
  );
}

const WORKING_DAY: LaneSpec[] = [
  {
    group: NORTHWIND,
    firstToday: true,
    tasks: [
      TASK_FIRING_4,
      TASK_BACK_WITH_NOTE,
      { ...TASK_PLAIN, id: "nw-ongoing" },
      { ...TASK_NEVER_FIRED, id: "nw-later", groupId: NORTHWIND.id, columnId: "col-later", title: "Tidy the asset folder" },
      { ...TASK_CLOSED, id: "nw-done", groupId: NORTHWIND.id },
    ],
  },
  {
    group: HARBOR,
    tasks: [TASK_FIRING_72, { ...TASK_PLAIN, id: "hb-ongoing", groupId: HARBOR.id, title: "Billing export" }],
  },
  {
    group: INTERNAL,
    hasFiring: true,
    tasks: [{ ...TASK_NEVER_FIRED, id: "in-firing", firingStartedAt: new Date(WORKFLOW_STORY_NOW.getTime() - 11 * 60_000) }],
  },
  { group: null, tasks: [{ ...TASK_NEVER_FIRED, id: "none-1", groupId: null, title: "Read the API changelog" }] },
];

/** Two firing, one next, one folded lane holding a firing task. */
export const AWorkingDay: Story = {
  name: "A working day",
  render: () => <DemoBoard columns={WORKING_COLUMNS} lanes={WORKING_DAY} />,
};

/** The queue: no active column, so no toggles and nothing is next. */
export const TheQueue: Story = {
  name: "The queue",
  render: () => (
    <DemoBoard
      columns={QUEUE_COLUMNS}
      lanes={[
        {
          group: NORTHWIND,
          tasks: [{ ...TASK_PLAIN, id: "q-1", columnId: "col-next", title: "Plan the autumn landing page" }],
        },
        {
          group: HARBOR,
          tasks: [{ ...TASK_PLAIN, id: "q-2", groupId: HARBOR.id, columnId: "col-someday", title: "Look into a faster test runner" }],
        },
      ]}
    />
  ),
};

/** No groups yet: *No group* with only its add row, then *Add a group*. */
export const FirstOpen: Story = {
  name: "First open",
  render: () => (
    <div className="flex flex-col">
      <DemoBoard columns={WORKING_COLUMNS} lanes={[{ group: null, tasks: [] }]} />
      <InlineAddRow label="Add a group" placeholder="Group, usually a client" maxLength={40} onSubmit={() => {}} />
    </div>
  ),
};

export const Loading: Story = { render: () => <BoardSkeleton /> };

function ScrolledSideways() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const scroller = ref.current?.querySelector<HTMLElement>(".overflow-x-auto");
    if (scroller) {
      scroller.scrollLeft = 200;
      scroller.dispatchEvent(new Event("scroll"));
    }
  }, []);
  return (
    <div ref={ref} style={{ width: 900 }}>
      <DemoBoard columns={WORKING_COLUMNS} lanes={WORKING_DAY} />
    </div>
  );
}

export const At900Scrolled: Story = {
  name: "At 900px, scrolled sideways",
  render: () => <ScrolledSideways />,
};

export const CompactOneColumn: Story = {
  name: "Compact, one column",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <DemoBoard columns={WORKING_COLUMNS} lanes={WORKING_DAY} visibleColumnId="col-progress" />,
};

/** One column: no sideways scroll, the one track fills. */
export const OneColumn: Story = {
  render: () => (
    <DemoBoard columns={[WORKING_COLUMNS[0] as WorkflowColumnView]} lanes={WORKING_DAY.slice(0, 2)} />
  ),
};
