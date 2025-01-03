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
      .$defaultFn(() => typeid("bml").toString()),
    name: text().notNull(),
    icon: text().notNull(),
    userId: text()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    quadrant1Id: text()
      .notNull()
      .references(() => topicQuadrantTable.id, { onDelete: "cascade" }),
    quadrant2Id: text()
      .notNull()
      .references(() => topicQuadrantTable.id, { onDelete: "cascade" }),
    quadrant3Id: text()
      .notNull()
      .references(() => topicQuadrantTable.id, { onDelete: "cascade" }),
    quadrant4Id: text()
      .notNull()
      .references(() => topicQuadrantTable.id, { onDelete: "cascade" }),
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
    quadrant1: one(topicQuadrantTable, {
      fields: [bookmarkTopicsTable.quadrant1Id],
      references: [topicQuadrantTable.id],
    }),
    quadrant2: one(topicQuadrantTable, {
      fields: [bookmarkTopicsTable.quadrant2Id],
      references: [topicQuadrantTable.id],
    }),
    quadrant3: one(topicQuadrantTable, {
      fields: [bookmarkTopicsTable.quadrant3Id],
      references: [topicQuadrantTable.id],
    }),
    quadrant4: one(topicQuadrantTable, {
      fields: [bookmarkTopicsTable.quadrant4Id],
      references: [topicQuadrantTable.id],
    }),
  }),
);

export const topicQuadrantTable = sqliteTable("topic_quadrants", {
  id: text()
    .primaryKey()
    .$defaultFn(() => typeid("bml").toString()),
  name: text().notNull(),
});

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
