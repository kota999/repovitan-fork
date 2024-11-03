import { createInsertSchema } from "drizzle-zod";
import { bookmarksTable } from "~/db/schema";

export const createBookmarkSchema = createInsertSchema(bookmarksTable).pick({
  url: true,
});
