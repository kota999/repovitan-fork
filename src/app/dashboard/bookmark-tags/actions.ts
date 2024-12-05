"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarkTagsTable } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkTagSchema } from "./validation";

async function createBookmarkTag({ name }: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.insert(bookmarkTagsTable).values({
    userId,
    name,
  });
}

export const createBookmarkTagAction = actionClient
  .schema(createBookmarkTagSchema)
  .action(async ({ parsedInput }) => {
    await createBookmarkTag(parsedInput);

    revalidatePath("/");

    return {
      successful: true,
    };
  });
