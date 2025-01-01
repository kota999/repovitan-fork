"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createBookmarkTopic as createBookmarkTopicMutation } from "~/db/mutation";
import { actionClient } from "~/lib/safe-action";
import { createBookmarkTopicSchema } from "./validation";

async function createBookmarkTopic({ name }: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await createBookmarkTopicMutation(userId, name);
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
