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
import { createInsertSchema } from "drizzle-zod";
import { typeid } from "typeid-js";

export const enum BookmarkTypes {
  LINK = "link",
  TEXT = "text",
  ASSET = "asset",
  UNKNOWN = "unknown",
}

// TODO: Clerkのユーザー名/ユーザーIDを手動登録しておかないと動かない
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

export const bookmarkTopicsTable = sqliteTable(
  "bookmark_topics",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("bt").toString()),
    name: text().notNull(),
    icon: text().notNull(),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    quadrant1Id: text()
      .notNull()
      .references(() => topicQuadrantsTable.id, { onDelete: "cascade" }),
    quadrant2Id: text()
      .notNull()
      .references(() => topicQuadrantsTable.id, { onDelete: "cascade" }),
    quadrant3Id: text()
      .notNull()
      .references(() => topicQuadrantsTable.id, { onDelete: "cascade" }),
    quadrant4Id: text()
      .notNull()
      .references(() => topicQuadrantsTable.id, { onDelete: "cascade" }),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
    updatedAt: integer({ mode: "timestamp" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdIdx: index("bookmark_topics_userId_idx").on(t.userId),
  }),
);

export const bookmarkTopicsRelations = relations(
  bookmarkTopicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [bookmarkTopicsTable.userId],
      references: [usersTable.id],
    }),
    quadrant1: one(topicQuadrantsTable, {
      fields: [bookmarkTopicsTable.quadrant1Id],
      references: [topicQuadrantsTable.id],
    }),
    quadrant2: one(topicQuadrantsTable, {
      fields: [bookmarkTopicsTable.quadrant2Id],
      references: [topicQuadrantsTable.id],
    }),
    quadrant3: one(topicQuadrantsTable, {
      fields: [bookmarkTopicsTable.quadrant3Id],
      references: [topicQuadrantsTable.id],
    }),
    quadrant4: one(topicQuadrantsTable, {
      fields: [bookmarkTopicsTable.quadrant4Id],
      references: [topicQuadrantsTable.id],
    }),
  }),
);

export const bookmarkTopicsToTopicMemosTable = sqliteTable(
  "bookmark_topics_to_topic_memos",
  {
    topicId: text()
      .notNull()
      .references(() => bookmarkTopicsTable.id, { onDelete: "cascade" }),
    memoId: text()
      .notNull()
      .references(() => topicMemosTable.id, { onDelete: "cascade" }),
  },
);

export const bookmarkTopicsToTopicMemosRelation = relations(
  bookmarkTopicsToTopicMemosTable,
  ({ one }) => ({
    topic: one(bookmarkTopicsTable, {
      fields: [bookmarkTopicsToTopicMemosTable.topicId],
      references: [bookmarkTopicsTable.id],
    }),
    memo: one(topicMemosTable, {
      fields: [bookmarkTopicsToTopicMemosTable.memoId],
      references: [topicMemosTable.id],
    }),
  }),
);

export const topicMemosTable = sqliteTable(
  "topic_memos",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("tm").toString()),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text().notNull(),
  },
  (t) => ({
    userIdIdx: index("memos_userId_idx").on(t.userId),
  }),
);
export const topicMemosRelation = relations(topicMemosTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [topicMemosTable.userId],
    references: [usersTable.id],
  }),
}));

// TODO: cascadeで消し飛ぶようにする
export const topicQuadrantsTable = sqliteTable(
  "topic_quadrants",
  {
    // quadrantId
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("tq").toString()),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text().notNull(),
  },
  (t) => ({
    userIdIdx: index("topic_quadrants_userId_idx").on(t.userId),
  }),
);

export const topicQuadrantsRelation = relations(
  topicQuadrantsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [topicQuadrantsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const topicQuadrantsToItemsTable = sqliteTable(
  "topic_quadrants_to_items",
  {
    quadrantId: text()
      .notNull()
      .references(() => topicQuadrantsTable.id, { onDelete: "cascade" }),
    // item = bookmark or memo
    itemId: text().notNull(),
    itemType: text({ enum: ["bookmark", "memo"] }).notNull(),
    position: integer(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.quadrantId, t.itemId] }),
    quadrantIdIdx: index("topic_quadrants_to_items_quadrantId_idx").on(
      t.quadrantId,
    ),
  }),
);

export const topicQuadrantsToItemsRelations = relations(
  topicQuadrantsToItemsTable,
  ({ one }) => ({
    topicQuadrant: one(topicQuadrantsTable, {
      fields: [topicQuadrantsToItemsTable.quadrantId],
      references: [topicQuadrantsTable.id],
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

// TODO: ブックマークリンクのcrawlStatusが意味ありげだが更新してなさそう
export const githubReposTable = sqliteTable(
  "github_repos",
  {
    id: integer().primaryKey(),
    owner: text().notNull(),
    name: text().notNull(),
    fullName: text().notNull(),
    htmlUrl: text().notNull(),
    description: text(),
    stargazersCount: integer().notNull(),
    pushedAt: integer({ mode: "timestamp" }),
    crawledAt: integer({ mode: "timestamp" }),
  },
  (t) => {
    return {
      fullNameIdx: index("github_repos_full_name_idx").on(t.name),
      stargazersCountIdx: index("github_repos_stargazers_count_idx").on(t.name),
    };
  },
);

export const nodejsProjectsTable = sqliteTable(
  "nodejs_projects",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("njp").toString()),
    repoId: integer()
      .notNull()
      .references(() => githubReposTable.id, {
        onDelete: "cascade",
      }),
    path: text().notNull(),
    htmlUrl: text().notNull(),
  },
  (t) => ({
    unq: unique().on(t.repoId, t.path),
    repoIdIdx: index("nodejs_projects_repo_id_idx").on(t.repoId),
  }),
);

export const nodeProjectsRelations = relations(
  nodejsProjectsTable,
  ({ one, many }) => ({
    repo: one(githubReposTable, {
      fields: [nodejsProjectsTable.repoId],
      references: [githubReposTable.id],
    }),
    projectsToPackages: many(nodejsProjectsToNpmPackagesTable),
  }),
);

export const npmPackagesTable = sqliteTable(
  "npm_packages",
  {
    id: text().primaryKey(),
    name: text().notNull(),
  },
  (t) => ({
    nameIdx: index("npm_packages_name_idx").on(t.name),
  }),
);

export const npmPackagesRelations = relations(npmPackagesTable, ({ many }) => ({
  projectsToPackages: many(nodejsProjectsToNpmPackagesTable),
}));

export const nodejsProjectsToNpmPackagesTable = sqliteTable(
  "nodejs_projects_to_npm_packages",
  {
    projectId: text()
      .notNull()
      .references(() => nodejsProjectsTable.id, {
        onDelete: "cascade",
      }),
    packageId: text()
      .notNull()
      .references(() => npmPackagesTable.id, {
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.packageId] }),
    projectIdIdx: index("nodejs_projects_to_npm_packages_project_id_idx").on(
      t.projectId,
    ),
    packageIdIdx: index("nodejs_projects_to_npm_packages_package_id_idx").on(
      t.packageId,
    ),
  }),
);

export const nodejsProjectsToNpmPackagesRelations = relations(
  nodejsProjectsToNpmPackagesTable,
  ({ one }) => ({
    project: one(nodejsProjectsTable, {
      fields: [nodejsProjectsToNpmPackagesTable.projectId],
      references: [nodejsProjectsTable.id],
    }),
    npmPackage: one(npmPackagesTable, {
      fields: [nodejsProjectsToNpmPackagesTable.packageId],
      references: [npmPackagesTable.id],
    }),
  }),
);

export const autoTagsForNpmPackagesTable = sqliteTable(
  "auto_tags_for_npm_packages",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("at").toString()),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tagId: text()
      .notNull()
      .references(() => bookmarkTagsTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    uniq: unique().on(t.userId, t.tagId),
    userIdIdx: index("auto_tags_for_npm_package_userId_idx").on(t.userId),
    tagIdIdx: index("auto_tags_for_npm_package_tagId_idx").on(t.tagId),
  }),
);

export const autoTagsForNpmPackagesRelation = relations(
  autoTagsForNpmPackagesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [autoTagsForNpmPackagesTable.userId],
      references: [usersTable.id],
    }),
    tag: one(bookmarkTagsTable, {
      fields: [autoTagsForNpmPackagesTable.tagId],
      references: [bookmarkTagsTable.id],
    }),
    keyword: many(autoTagKeywordsTable),
  }),
);

export const autoTagKeywordsTable = sqliteTable(
  "auto_tag_keywords",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => typeid("atk").toString()),
    autoTagId: text()
      .notNull()
      .references(() => autoTagsForNpmPackagesTable.id, {
        onDelete: "cascade",
      }),
    keyword: text().notNull(),
  },
  (t) => ({
    uniq: unique().on(t.autoTagId, t.keyword),
    autoTagIdIdx: index("auto_tag_keyword_auto_tagId_idx").on(t.autoTagId),
    keywordIdx: index("auto_tag_keyword_auto_keyword_idx").on(t.keyword),
  }),
);

export const autoTagKeywordsRelation = relations(
  autoTagKeywordsTable,
  ({ one }) => ({
    autoTag: one(autoTagsForNpmPackagesTable, {
      fields: [autoTagKeywordsTable.autoTagId],
      references: [autoTagsForNpmPackagesTable.id],
    }),
  }),
);

export const tasks = sqliteTable("tasks", {
  id: text({ length: 30 })
    .primaryKey()
    .$defaultFn(() => typeid("tsk").toString()),
  code: text({ length: 128 }).notNull().unique(),
  title: text({ length: 128 }),
  status: text({
    length: 30,
    enum: ["todo", "in-progress", "done", "canceled"],
  })
    .notNull()
    .default("todo"),
  label: text({
    length: 30,
    enum: ["bug", "feature", "enhancement", "documentation"],
  })
    .notNull()
    .default("bug"),
  priority: text({
    length: 30,
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("low"),
  archived: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(cast(unixepoch() as int))`),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(cast(unixepoch() as int))`)
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export const insertTaskSchema = createInsertSchema(tasks);
