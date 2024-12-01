"use server";

import { auth } from "@clerk/nextjs/server";
import mql from "@microlink/mql";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarkLinksTable, bookmarksTable, BookmarkTypes } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkSchema } from "./validation";

async function createBookmark({ url }: { url: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data, response } = await mql(url, {
    meta: true,
  });
  await db.transaction(async (tx) => {
    const [bm] = await tx
      .insert(bookmarksTable)
      .values({ userId, title: data?.title, type: BookmarkTypes.LINK })
      .returning({
        id: bookmarksTable.id,
      });
    if (bm) {
      await tx.insert(bookmarkLinksTable).values({
        id: bm.id,
        url,
        title: data?.title,
        description: data?.description,
        imageUrl: data?.image?.url,
        favicon: data?.logo?.url,
      });
    }
  });

  return {
    rateLimitRemaining: Number(response.headers.get("x-rate-limit-remaining")),
  };
}

export const createBookmarkAction = actionClient
  .schema(createBookmarkSchema)
  .action(async ({ parsedInput }) => {
    const { rateLimitRemaining } = await createBookmark(parsedInput);

    revalidatePath("/");

    return {
      successful: true,
      rateLimitRemaining,
    };
  });
