"use server";

import { auth } from "@clerk/nextjs/server";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarksTable } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkSchema } from "./validation";

async function createBookmark(newBookmark: { url: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  await db.insert(bookmarksTable).values({ ...newBookmark, userId });
}

export const createBookmarkAction = actionClient
  .schema(createBookmarkSchema)
  .action(async ({ parsedInput }) => {
    const registeredBookmark = await db.query.bookmarksTable.findFirst({
      where: (bookmarks, { eq }) => eq(bookmarks.url, parsedInput.url),
    });
    if (registeredBookmark) {
      returnValidationErrors(createBookmarkSchema, {
        url: {
          _errors: ["URL already registered"],
        },
      });
    }

    await createBookmark(parsedInput);

    revalidatePath("/");

    return {
      successful: true,
      bookmark: parsedInput,
    };
  });
