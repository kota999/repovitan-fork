import { notFound } from "next/navigation";
import { TopicKanbanBoard } from "./components/topic-kanban-board";
import type { Item } from "./components/item-card";
import { getBookmarkTopic, getTopicQuadrantsWithItems } from "~/db/query";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/db";

//const initialQuadrantArrangement = "horizontal"
//const initialQuadrantArrangement = "vertical"
const initialQuadrantArrangement = "grid2x2";

export default async function BookmarkTopicPage({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // bookmarkTopic
  const { bookmarkTopicId } = await params;
  const bookmarkTopic = await getBookmarkTopic(bookmarkTopicId);
  if (!bookmarkTopic) {
    notFound();
  }
  const initialQuadrants = [
    {
      id: bookmarkTopic.quadrant1Id,
      title: bookmarkTopic.quadrant1.name,
    },
    {
      id: bookmarkTopic.quadrant2Id,
      title: bookmarkTopic.quadrant2.name,
    },
    {
      id: bookmarkTopic.quadrant3Id,
      title: bookmarkTopic.quadrant3.name,
    },
    {
      id: bookmarkTopic.quadrant4Id,
      title: bookmarkTopic.quadrant4.name,
    },
  ];

  // bookmarks (registered)
  const quadrantsWithItems = await getTopicQuadrantsWithItems(
    initialQuadrants.map((quadrant) => quadrant.id),
  );
  const registeredBookmarks = quadrantsWithItems
    .flat()
    .map((qis) => ({ bookmark: qis.bookmark, quadrantId: qis.quadrantId }));
  const registeredItems: Item[] = registeredBookmarks.map((bookmark) => ({
    id: bookmark.bookmark.id,
    quadrantId: bookmark.quadrantId,
    title: bookmark.bookmark.title ?? "",
    description: bookmark.bookmark.link.description ?? "",
    imageUrl: bookmark.bookmark.link.imageUrl ?? "",
    bookmarksToTags: bookmark.bookmark.bookmarksToTags,
    badge: "bookmark",
  }));
  // not registered
  const inboxBookmarks = await db.query.bookmarksTable.findMany({
    where: (bookmarksTable, { notInArray }) =>
      notInArray(
        bookmarksTable.id,
        registeredItems.map((item) => item.id as string),
      ),
    orderBy: (bookmarksTable, { desc }) => [desc(bookmarksTable.updatedAt)],
    with: {
      link: true,
      bookmarksToTags: {
        with: {
          tag: true,
        },
      },
    },
  });
  const inboxItems: Item[] = inboxBookmarks.map((bookmark) => ({
    id: bookmark.id,
    quadrantId: "",
    title: bookmark.title ?? "",
    description: bookmark.link.description ?? "",
    imageUrl: bookmark.link.imageUrl ?? "",
    bookmarksToTags: bookmark.bookmarksToTags,
    badge: "bookmark",
  }));
  // initialItems (merged)
  const initialItems = [...registeredItems, ...inboxItems];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{bookmarkTopic.name}</div>
      <TopicKanbanBoard
        initialQuadrants={initialQuadrants}
        initialItems={initialItems}
        quadrantArrangement={initialQuadrantArrangement}
      />
    </div>
  );
}
