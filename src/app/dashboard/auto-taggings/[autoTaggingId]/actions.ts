"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { actionClient } from "~/lib/safe-action";
import {
  bindCreateAutoTagKeywordArgsSchemas,
  createAutoTagKeywordSchema,
} from "./validation";
import { autoTagKeywordsTable } from "~/db/schema";

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
