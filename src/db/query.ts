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

export const getTopicQuadrantsWithItems = async (quadrantIds: string[]) => {
  const quadrantsWithItems = Promise.all(
    quadrantIds.map(async (quadrantId) => {
      const items = await db.query.topicQuadrantsToBookmarksTable.findMany({
        where: (topicQuadrantsToBookmarksTable, { eq }) =>
          eq(topicQuadrantsToBookmarksTable.quadrantId, quadrantId),
        orderBy: (topicQuadrantsToBookmarksTable, { asc }) => [
          asc(topicQuadrantsToBookmarksTable.position),
        ],
        with: {
          bookmark: {
            with: {
              link: true,
              bookmarksToTags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
      });
      return items;
    }),
  );
  return quadrantsWithItems;
};
