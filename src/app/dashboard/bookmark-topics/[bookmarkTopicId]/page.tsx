import { notFound } from "next/navigation";
import { KanbanBoard } from "./components/kanban-board";
import type { Item } from "./components/item-card";
import { getBookmarkTopic } from "~/db/query";
import { auth } from "@clerk/nextjs/server";

//const initialQuadrantArrangement = "horizontal"
//const initialQuadrantArrangement = "vertical"
const initialQuadrantArrangement = "grid2x2";

const initialItems: Item[] = [
  {
    id: "item1",
    quadrantId: "q3",
    content: "Project initiation and planning",
    badge: "TASK",
  },
  {
    id: "item2",
    quadrantId: "q3",
    content: "Gather requirements from stakeholders",
    badge: "TASK",
  },
  {
    id: "item3",
    quadrantId: "q3",
    content: "Create wireframes and mockups",
    badge: "TASK",
  },
  {
    id: "item4",
    quadrantId: "q2",
    content: "Develop homepage layout",
    badge: "TASK",
  },
  {
    id: "item5",
    quadrantId: "q2",
    content: "Design color scheme and typography",
    badge: "TASK",
  },
  {
    id: "item6",
    quadrantId: "q1",
    content: "Implement user authentication",
    badge: "TASK",
  },
];

export default async function BookmarkTopicPage({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { bookmarkTopicId } = await params;
  const bookmarkTopic = await getBookmarkTopic(bookmarkTopicId);
  if (!bookmarkTopic) {
    notFound();
  }

  const initialQuadrants = [
    {
      id: "q1",
      title: bookmarkTopic.quadrant1.name,
      dbId: bookmarkTopic.quadrant1Id,
    },
    {
      id: "q2",
      title: bookmarkTopic.quadrant2.name,
      dbId: bookmarkTopic.quadrant2Id,
    },
    {
      id: "q3",
      title: bookmarkTopic.quadrant3.name,
      dbId: bookmarkTopic.quadrant3Id,
    },
    {
      id: "q4",
      title: bookmarkTopic.quadrant4.name,
      dbId: bookmarkTopic.quadrant4Id,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{bookmarkTopic.name}</div>
      <KanbanBoard
        initialQuadrants={initialQuadrants}
        initialItems={initialItems}
        quadrantArrangement={initialQuadrantArrangement}
      />
    </div>
  );
}
