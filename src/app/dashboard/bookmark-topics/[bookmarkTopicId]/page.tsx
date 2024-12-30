import { notFound } from "next/navigation";
import { db } from "~/db";
import { KanbanBoard } from "./components/KanbanBoard";
import type { Column } from "./components/BoardColumn";
import type { Item } from "./components/ItemCard";

const defaultCols = [
  {
    id: "todo" as const,
    title: "Todo",
  },
  {
    id: "in-progress" as const,
    title: "In progress",
  },
  {
    id: "done" as const,
    title: "Done",
  },
  {
    id: "freeze" as const,
    title: "Freeze",
  },
] satisfies Column[];

const initialItems: Item[] = [
  {
    id: "item1",
    columnId: "done",
    content: "Project initiation and planning",
    badge: "TASK",
  },
  {
    id: "item2",
    columnId: "done",
    content: "Gather requirements from stakeholders",
    badge: "TASK",
  },
  {
    id: "item3",
    columnId: "done",
    content: "Create wireframes and mockups",
    badge: "TASK",
  },
  {
    id: "item4",
    columnId: "in-progress",
    content: "Develop homepage layout",
    badge: "TASK",
  },
  {
    id: "item5",
    columnId: "in-progress",
    content: "Design color scheme and typography",
    badge: "TASK",
  },
  {
    id: "item6",
    columnId: "todo",
    content: "Implement user authentication",
    badge: "TASK",
  },
  {
    id: "item7",
    columnId: "todo",
    content: "Build contact us page",
    badge: "TASK",
  },
  {
    id: "item8",
    columnId: "todo",
    content: "Create product catalog",
    badge: "TASK",
  },
  {
    id: "item9",
    columnId: "todo",
    content: "Develop about us page",
    badge: "TASK",
  },
  {
    id: "item10",
    columnId: "todo",
    content: "Optimize website for mobile devices",
    badge: "TASK",
  },
  {
    id: "item11",
    columnId: "todo",
    content: "Integrate payment gateway",
    badge: "TASK",
  },
  {
    id: "item12",
    columnId: "todo",
    content: "Perform testing and bug fixing",
    badge: "TASK",
  },
  {
    id: "item13",
    columnId: "todo",
    content: "Launch website and deploy to server",
    badge: "TASK",
  },
];

export default async function BookmarkTopicPage({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { bookmarkTopicId } = await params;
  const bookmarkTopic = await db.query.bookmarkTopicsTable.findFirst({
    where: (bookmarkTopicsTable, { eq }) =>
      eq(bookmarkTopicsTable.id, bookmarkTopicId),
  });

  if (!bookmarkTopic) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{bookmarkTopic.name}</div>
      <KanbanBoard cols={defaultCols} initialItems={initialItems} />
    </div>
  );
}
