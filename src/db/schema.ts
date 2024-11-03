import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { typeid } from "typeid-js";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("name").notNull(),
});

export const bookmarksTable = sqliteTable("bookmarks", {
  id: text()
    .$defaultFn(() => typeid("bm").toString())
    .primaryKey(),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  url: text().notNull().unique(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(cast(unixepoch() as int))`),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Bookmark = typeof bookmarksTable.$inferSelect;
