import { notFound } from "next/navigation";
import { TopicKanbanBoard } from "./components/topic-kanban-board";
import type { Item } from "./components/item-card";
import {
  getBookmarks,
  getBookmarkTopic,
  getTopicMemos,
  getTopicQuadrantsWithItemsRelation,
} from "~/db/query";

//const initialQuadrantArrangement = "horizontal"
//const initialQuadrantArrangement = "vertical"
const initialQuadrantArrangement = "grid2x2";

export const dynamic = "force-dynamic";

export default async function BookmarkTopicPage({
  params,
}: {
  params: { bookmarkTopicId: string; share?: boolean };
}) {
  // bookmarkTopic
  const { bookmarkTopicId, share } = params;
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

  // relations for id of registered item (bookmark and memo) and quadrant
  const registeredItemRelations = await getTopicQuadrantsWithItemsRelation(
    initialQuadrants.map((quadrant) => quadrant.id),
  );
  // utility for filtering registered itemId
  const registeredItemIds: string[] = registeredItemRelations
    .flat()
    .map((item) => item.itemId);
  // all bookmarks and memos (registered and not registered)
  // TODO: 暫定で全件取得。いい感じのFetch単位はなんだ？
  const bookmarks = await getBookmarks();
  const memos = await getTopicMemos(bookmarkTopic.id);

  // registered item ( = bookmark and memo)
  const registeredItems: Item[] = registeredItemRelations.flat().map((rel) => {
    if (rel.itemType === "bookmark") {
      const bookmark = bookmarks.findLast(
        (bookmark) => bookmark.id === rel.itemId,
      );
      return {
        id: rel.itemId ?? "",
        quadrantId: rel.quadrantId,
        type: rel.itemType,
        content: {
          title: bookmark?.title ?? "",
          description: bookmark?.link.description ?? "",
          imageUrl: bookmark?.link.imageUrl ?? "",
          bookmarksToTags:
            bookmark?.bookmarksToTags.map((b2t) => ({
              tag: { id: b2t.tag.id, name: b2t.tag.name },
            })) ?? [],
        },
      } satisfies Item;
    } else {
      // memo
      const memo = memos.findLast((memo) => memo.memoId === rel.itemId);
      return {
        id: rel.itemId ?? "",
        quadrantId: rel.quadrantId,
        type: rel.itemType,
        content: {
          content: memo?.memo.content ?? "",
        },
      } satisfies Item;
    }
  });
  // not registered item (= bookmark) => Inbox)
  const inboxItems: Item[] = bookmarks
    .filter((bookmark) => !registeredItemIds.includes(bookmark.id))
    .map((bookmark) => ({
      id: bookmark.id,
      quadrantId: "",
      type: "bookmark",
      content: {
        title: bookmark.title ?? "",
        description: bookmark.link.description ?? "",
        imageUrl: bookmark.link.imageUrl ?? "",
        bookmarksToTags: bookmark.bookmarksToTags,
      },
    }));
  // not registered memo = memo box
  const memoItems: Item[] = memos
    .filter((memo) => !registeredItemIds.includes(memo.memoId))
    .map((memo) => ({
      id: memo.memoId,
      quadrantId: "",
      type: "memo",
      content: {
        content: memo.memo.content ?? "",
      },
    }));
  // initialItems (merged)
  const initialItems = [...registeredItems, ...inboxItems, ...memoItems];

  return (
    <TopicKanbanBoard
      topicId={bookmarkTopic.id}
      topicName={bookmarkTopic.name}
      initialQuadrants={initialQuadrants}
      initialItems={initialItems}
      quadrantArrangement={initialQuadrantArrangement}
      share={share}
    />
  );
}
