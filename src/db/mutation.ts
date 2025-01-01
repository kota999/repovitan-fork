import { db } from ".";
import { bookmarkTopicsTable } from "./schema";

export const createBookmarkTopic = async (userId: string, name: string) => {
  await db.insert(bookmarkTopicsTable).values({
    userId,
    name,
    icon: "",
  });
};
