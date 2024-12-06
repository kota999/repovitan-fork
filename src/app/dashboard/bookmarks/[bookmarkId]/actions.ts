"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarksTable, bookmarksToTagsTable } from "~/db/schema";
import { actionClient, authActionClient } from "~/lib/safe-action";
import {
  bindArgsSchemas,
  updateTagsSchema,
  updateTitleSchema,
} from "./validation";

async function updateTitle({
  bookmarkId,
  title,
}: {
  bookmarkId: string;
  title: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(bookmarksTable)
    .set({ title })
    .where(eq(bookmarksTable.id, bookmarkId));
}

export const updateTitleAction = actionClient
  .schema(updateTitleSchema)
  .bindArgsSchemas(bindArgsSchemas)
  .action(
    async ({ parsedInput: { title }, bindArgsParsedInputs: [bookmarkId] }) => {
      await updateTitle({
        bookmarkId,
        title,
      });

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );

export const updateTagsAction = authActionClient
  .schema(updateTagsSchema)
  .bindArgsSchemas(bindArgsSchemas)
  .action(
    async ({
      ctx: { userId },
      parsedInput: { tagNames },
      bindArgsParsedInputs: [bookmarkId],
    }) => {
      await db.transaction(async (tx) => {
        const bookmark = await db.query.bookmarksTable.findFirst({
          where: (bookmarks, { and, eq }) =>
            and(eq(bookmarks.userId, userId), eq(bookmarks.id, bookmarkId)),
          with: {
            bookmarksToTags: {
              with: {
                tag: true,
              },
            },
          },
        });
        if (!bookmark) {
          throw new Error("Bookmark not found");
        }

        const tags = bookmark.bookmarksToTags.map(({ tag }) => tag);

        const bookmarkTags = await tx.query.bookmarkTagsTable.findMany({
          where: (bookmarkTags, { and, eq, inArray }) =>
            and(
              eq(bookmarkTags.userId, userId),
              inArray(bookmarkTags.name, tagNames),
            ),
        });
        const tagIds = bookmarkTags.map(({ id }) => id);
        const detach = tags
          .map(({ id }) => id)
          .filter((tagId) => !tagIds.includes(tagId));
        const attach = tagIds.filter(
          (tagId) => !tags.map(({ id }) => id).includes(tagId),
        );

        const idsToRemove: string[] = [];
        if (detach.length > 0) {
          detach.forEach((tagId) => {
            idsToRemove.push(tagId);
          });

          await tx
            .delete(bookmarksToTagsTable)
            .where(
              and(
                eq(bookmarksToTagsTable.bookmarkId, bookmarkId),
                inArray(bookmarksToTagsTable.tagId, idsToRemove),
              ),
            );
        }

        if (attach.length > 0) {
          await tx
            .insert(bookmarksToTagsTable)
            .values(
              attach.map((tagId) => ({
                tagId,
                bookmarkId,
              })),
            )
            .onConflictDoNothing();
        }
      });

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );
