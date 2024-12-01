import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { typeid } from "typeid-js";

export const enum BookmarkTypes {
  LINK = "link",
  TEXT = "text",
  ASSET = "asset",
  UNKNOWN = "unknown",
}

export const usersTable = sqliteTable("users", {
  id: text().primaryKey(),
  username: text().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  bookmarks: many(bookmarksTable),
}));

export const bookmarksTable = sqliteTable(
  "bookmarks",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("bm").toString()),
    title: text(),
    archived: integer({ mode: "boolean" }).notNull().default(false),
    favorited: integer({ mode: "boolean" }).notNull().default(false),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    taggingStatus: text({
      enum: ["pending", "failure", "success"],
    }).default("pending"),
    summary: text(),
    note: text(),
    type: text({
      enum: [BookmarkTypes.LINK, BookmarkTypes.TEXT, BookmarkTypes.ASSET],
    }).notNull(),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
    updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdIdx: index("bookmarks_userId_idx").on(t.userId),
    archivedIdx: index("bookmarks_archived_idx").on(t.archived),
    favoritedIdx: index("bookmarks_favorited_idx").on(t.favorited),
    createdAtIdx: index("bookmarks_createdAt_idx").on(t.createdAt),
  }),
);

export const bookmarkRelations = relations(bookmarksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [bookmarksTable.userId],
    references: [usersTable.id],
  }),
  link: one(bookmarkLinksTable, {
    fields: [bookmarksTable.id],
    references: [bookmarkLinksTable.id],
  }),
}));

export const bookmarkLinksTable = sqliteTable(
  "bookmarkLinks",
  {
    id: text()
      .primaryKey()
      .references(() => bookmarksTable.id, { onDelete: "cascade" }),
    url: text().notNull(),
    title: text(),
    description: text(),
    imageUrl: text(),
    favicon: text(),
    content: text(),
    htmlContent: text(),
    crawledAt: integer({ mode: "timestamp" }),
    crawlStatus: text({
      enum: ["pending", "failure", "success"],
    }).default("pending"),
  },
  (t) => {
    return {
      urlIdx: index("bookmarkLinks_url_idx").on(t.url),
    };
  },
);
