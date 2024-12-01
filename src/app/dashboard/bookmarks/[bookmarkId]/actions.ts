"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { bookmarksTable } from "~/db/schema";
import { actionClient } from "~/lib/safe-action";
import { bindArgsSchemas, updateTitleSchema } from "./validation";

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
