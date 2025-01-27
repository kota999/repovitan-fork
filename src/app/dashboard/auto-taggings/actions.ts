"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { autoTagsForNpmPackagesTable } from "~/db/schema";
import { authActionClient } from "~/lib/safe-action";
import { updateAutoTagsSchema } from "./validation";

export const updateAutoTags = async (userId: string, tagNames: string[]) => {
  await db.transaction(async (tx) => {
    const autoTags = await tx.query.autoTagsForNpmPackagesTable.findMany({
      where: (autoTagsForNpmPackagesTable, { eq }) =>
        eq(autoTagsForNpmPackagesTable.userId, userId),
      with: {
        tag: true,
      },
    });

    const bookmarkTags = await tx.query.bookmarkTagsTable.findMany({
      where: (bookmarkTags, { and, eq, inArray }) =>
        and(
          eq(bookmarkTags.userId, userId),
          inArray(bookmarkTags.name, tagNames),
        ),
    });
    const tagIds = bookmarkTags.map(({ id }) => id);

    const detach = autoTags
      .map(({ tagId }) => tagId)
      .filter((tagId) => !tagIds.includes(tagId));
    const attach = tagIds.filter(
      (tagId) => !autoTags.map((autoTag) => autoTag.tagId).includes(tagId),
    );

    const idsToRemove: string[] = [];
    if (detach.length > 0) {
      detach.forEach((tagId) => {
        idsToRemove.push(tagId);
      });

      await tx
        .delete(autoTagsForNpmPackagesTable)
        .where(
          and(
            eq(autoTagsForNpmPackagesTable.userId, userId),
            inArray(autoTagsForNpmPackagesTable.tagId, idsToRemove),
          ),
        );
    }

    if (attach.length > 0) {
      await tx
        .insert(autoTagsForNpmPackagesTable)
        .values(
          attach.map((tagId) => ({
            tagId,
            userId,
          })),
        )
        .onConflictDoNothing();
    }
  });
  return;
};

export const updateAutoTagsAction = authActionClient
  .schema(updateAutoTagsSchema)
  .action(
    async ({
      ctx: { userId },
      parsedInput: { tagNames },
    }: {
      ctx: { userId: string };
      parsedInput: { tagNames: string[] };
    }) => {
      await updateAutoTags(userId, tagNames);

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );
