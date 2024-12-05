"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarkListsTable } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkListSchema } from "./validation";

async function createBookmarkList({ name }: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.insert(bookmarkListsTable).values({
    userId,
    name,
    icon: "",
  });
}

export const createBookmarkListAction = actionClient
  .schema(createBookmarkListSchema)
  .action(async ({ parsedInput }) => {
    await createBookmarkList(parsedInput);

    revalidatePath("/");

    return {
      successful: true,
    };
  });
