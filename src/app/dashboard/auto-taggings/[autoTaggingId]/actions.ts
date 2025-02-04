"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { actionClient } from "~/lib/safe-action";
import {
  bindCreateAutoTagKeywordArgsSchemas,
  createAutoTagKeywordSchema,
  deleteAutoTagKeywordSchema,
} from "./validation";
import { autoTagKeywordsTable } from "~/db/schema";
import { eq } from "drizzle-orm";

async function createAutoTagKeyword({
  keyword,
  autoTagId,
}: {
  keyword: string;
  autoTagId: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .insert(autoTagKeywordsTable)
    .values({
      autoTagId,
      keyword,
    })
    .onConflictDoNothing();
}

export const createAutoTagKeywordAction = actionClient
  .schema(createAutoTagKeywordSchema)
  .bindArgsSchemas(bindCreateAutoTagKeywordArgsSchemas)
  .action(async ({ parsedInput, bindArgsParsedInputs: [autoTagId] }) => {
    await createAutoTagKeyword({
      keyword: parsedInput.keyword,
      autoTagId: autoTagId,
    });

    revalidatePath("/dashboard/auto-taggings");

    return {
      successful: true,
    };
  });

async function deleteAutoTagKeyword({ keywordId }: { keywordId: string }) {
  await db
    .delete(autoTagKeywordsTable)
    .where(eq(autoTagKeywordsTable.id, keywordId));
}

export const deleteAutoTagKeywordAction = async (keywordId: string) => {
  const parsedInput = deleteAutoTagKeywordSchema.safeParse({
    keywordId: keywordId,
  });
  if (parsedInput.error) {
    return {
      success: false,
    };
  }

  await deleteAutoTagKeyword({
    keywordId: keywordId,
  });

  revalidatePath("/dashboard/auto-taggings");

  return {
    successful: true,
  };
};
