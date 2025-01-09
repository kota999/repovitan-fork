import { db } from ".";

export const getBookmarkTopics = async () => {
  const bookmarkTopics = await db.query.bookmarkTopicsTable.findMany({
    orderBy: (bookmarkTopicsTable, { desc }) => [
      desc(bookmarkTopicsTable.updatedAt),
    ],
  });
  return bookmarkTopics;
};

export const getBookmarkTopic = async (bookmarkTopicId: string) => {
  const bookmarkTopic = await db.query.bookmarkTopicsTable.findFirst({
    where: (bookmarkTopicsTable, { eq }) =>
      eq(bookmarkTopicsTable.id, bookmarkTopicId),
    with: {
      quadrant1: true,
      quadrant2: true,
      quadrant3: true,
      quadrant4: true,
    },
  });
  return bookmarkTopic;
};

export const getTopicQuadrantsWithItemsRelation = async (
  quadrantIds: string[],
) => {
  const quadrantsWithItemsRelation = Promise.all(
    quadrantIds.map(async (quadrantId) => {
      // items fetch
      const items = await db.query.topicQuadrantsToItemsTable.findMany({
        where: (topicQuadrantsToItemsTable, { eq }) =>
          eq(topicQuadrantsToItemsTable.quadrantId, quadrantId),
        orderBy: (topicQuadrantsToItemsTable, { asc }) => [
          asc(topicQuadrantsToItemsTable.position),
        ],
      });
      return items;
    }),
  );
  return quadrantsWithItemsRelation;
};

export const getBookmarks = async () => {
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
  return bookmarks;
};

export const getTopicMemos = async (topicId: string) => {
  const topicMemos = await db.query.bookmarkTopicsToTopicMemosTable.findMany({
    where: (bookmarkTopicsToTopicMemosTable, { eq }) =>
      eq(bookmarkTopicsToTopicMemosTable.topicId, topicId),
    with: {
      memo: true,
    },
  });
  return topicMemos;
};
