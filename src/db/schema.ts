import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
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

export const bookmarkRelations = relations(bookmarksTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [bookmarksTable.userId],
    references: [usersTable.id],
  }),
  link: one(bookmarkLinksTable, {
    fields: [bookmarksTable.id],
    references: [bookmarkLinksTable.id],
  }),
  bookmarksToTags: many(bookmarksToTagsTable),
}));

export const bookmarkLinksTable = sqliteTable(
  "bookmark_links",
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

export const bookmarkTagsTable = sqliteTable(
  "bookmark_tags",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("bmt").toString()),
    name: text().notNull(),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
    updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniq: unique().on(t.userId, t.name),
    nameIdx: index("bookmark_tags_name_idx").on(t.name),
    userIdIdx: index("bookmark_tags_userId_idx").on(t.userId),
  }),
);

export const bookmarkTagsRelations = relations(
  bookmarkTagsTable,
  ({ many, one }) => ({
    user: one(usersTable, {
      fields: [bookmarkTagsTable.userId],
      references: [usersTable.id],
    }),
    bookmarksToTags: many(bookmarksToTagsTable),
  }),
);

export const bookmarksToTagsTable = sqliteTable(
  "bookmarks_to_tags",
  {
    bookmarkId: text()
      .notNull()
      .references(() => bookmarksTable.id, { onDelete: "cascade" }),
    tagId: text()
      .notNull()
      .references(() => bookmarkTagsTable.id, { onDelete: "cascade" }),
    attachedAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookmarkId, t.tagId] }),
    tagIdIdx: index("bookmarks_to_tags_tagId_idx").on(t.tagId),
    bookmarkIdIdx: index("bookmarks_to_tags_bookmarkId_idx").on(t.bookmarkId),
  }),
);

export const bookmarksToTagsRelations = relations(
  bookmarksToTagsTable,
  ({ one }) => ({
    tag: one(bookmarkTagsTable, {
      fields: [bookmarksToTagsTable.tagId],
      references: [bookmarkTagsTable.id],
    }),
    bookmark: one(bookmarksTable, {
      fields: [bookmarksToTagsTable.bookmarkId],
      references: [bookmarksTable.id],
    }),
  }),
);

export const bookmarkListsTable = sqliteTable(
  "bookmark_lists",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("bml").toString()),
    name: text().notNull(),
    icon: text().notNull(),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    parentId: text().references((): AnySQLiteColumn => bookmarkListsTable.id, {
      onDelete: "set null",
    }),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
    updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdIdx: index("bookmark_lists_userId_idx").on(t.userId),
  }),
);

export const bookmarkListsRelations = relations(
  bookmarkListsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [bookmarkListsTable.userId],
      references: [usersTable.id],
    }),
    parent: one(bookmarkListsTable, {
      fields: [bookmarkListsTable.parentId],
      references: [bookmarkListsTable.id],
      relationName: "children",
    }),
    children: many(bookmarkListsTable, { relationName: "children" }),
    bookmarksToLists: many(bookmarksToListsTable),
  }),
);

export const bookmarksToListsTable = sqliteTable(
  "bookmarks_to_lists",
  {
    bookmarkId: text()
      .notNull()
      .references(() => bookmarksTable.id, { onDelete: "cascade" }),
    listId: text()
      .notNull()
      .references(() => bookmarkListsTable.id, { onDelete: "cascade" }),
    addedAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookmarkId, t.listId] }),
    bookmarkIdIdx: index("bookmarks_to_lists_bookmarkId_idx").on(t.bookmarkId),
    listIdIdx: index("bookmarks_to_lists_listId_idx").on(t.listId),
  }),
);

export const bookmarksToListsRelations = relations(
  bookmarksToListsTable,
  ({ one }) => ({
    bookmark: one(bookmarksTable, {
      fields: [bookmarksToListsTable.bookmarkId],
      references: [bookmarksTable.id],
    }),
    list: one(bookmarkListsTable, {
      fields: [bookmarksToListsTable.listId],
      references: [bookmarkListsTable.id],
    }),
  }),
);
