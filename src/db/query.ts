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
