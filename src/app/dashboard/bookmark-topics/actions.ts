"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarkTopicsTable } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkTopicSchema } from "./validation";

async function createBookmarkTopic({ name }: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.insert(bookmarkTopicsTable).values({
    userId,
    name,
    icon: "",
  });
}

export const createBookmarkTopicAction = actionClient
  .schema(createBookmarkTopicSchema)
  .action(async ({ parsedInput }) => {
    await createBookmarkTopic(parsedInput);

    revalidatePath("/");

    return {
      successful: true,
    };
  });
