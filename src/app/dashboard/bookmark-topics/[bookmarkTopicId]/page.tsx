import { notFound } from "next/navigation";
import { TopicKanbanBoard } from "./components/topic-kanban-board";
import type { Item } from "./components/item-card";
import { getBookmarkTopic } from "~/db/query";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/db";

//const initialQuadrantArrangement = "horizontal"
//const initialQuadrantArrangement = "vertical"
const initialQuadrantArrangement = "grid2x2";

const defaultQuadrantsInfo = {
  quadrant1Id: "q0",
  quadrant2Id: "q1",
  quadrant3Id: "q2",
  quadrant4Id: "q3",
};

// test
//const initialItems: Item[] = [
//  {
//    id: "bm_01jfmvdm2ee0195kq3t20tgp08",
//    quadrantId: "q1",
//    title: "GitHub - hoarder-app/hoarder: A self-hostable bookmark-everything app (links, notes and images) with AI-based automatic tagging and full text search",
//    description: "A self-hostable bookmark-everything app (links, notes and images) with AI-based automatic tagging and full text search - hoarder-app/hoarder",
//    imageUrl: "https://opengraph.githubassets.com/9a02c42d27bee630c59970f85389249a7fb6b8be8de86a96900a0ac6bf08baea/hoarder-app/hoarder",
//    bookmarksToTags: [{ tag: {id : "bmt_01jfwzwdxhecy919wx3jj83hbz", name : "tag"} },{ tag: {id : "bmt_01jfwzwdxhecy919wx3jj83hbz2", name : "tag2"} }],
//    badge: "BOOKMARK",
//  },
//];

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
      id: defaultQuadrantsInfo.quadrant1Id,
      title: bookmarkTopic.quadrant1.name,
      dbId: bookmarkTopic.quadrant1Id,
    },
    {
      id: defaultQuadrantsInfo.quadrant2Id,
      title: bookmarkTopic.quadrant2.name,
      dbId: bookmarkTopic.quadrant2Id,
    },
    {
      id: defaultQuadrantsInfo.quadrant3Id,
      title: bookmarkTopic.quadrant3.name,
      dbId: bookmarkTopic.quadrant3Id,
    },
    {
      id: defaultQuadrantsInfo.quadrant4Id,
      title: bookmarkTopic.quadrant4.name,
      dbId: bookmarkTopic.quadrant4Id,
    },
  ];

  // bookmarks (kari)
  // TODO: 要更新
  const bookmarks = await db.query.bookmarksTable.findMany({
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
  const initialItems: Item[] = bookmarks.map((bookmark) => ({
    id: bookmark.id,
    quadrantId: "",
    title: bookmark.title ?? "",
    description: bookmark.link.description ?? "",
    imageUrl: bookmark.link.imageUrl ?? "",
    bookmarksToTags: bookmark.bookmarksToTags,
    badge: "bookmark",
  }));

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
