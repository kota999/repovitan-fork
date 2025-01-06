"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createOrUpdateTopicQuadrantsToBookmarks,
  updateTopicQuadrant,
} from "~/db/mutation";
import { actionClient } from "~/lib/safe-action";
import {
  bindEditQuadrantTitleSchemas,
  updateQuadrantTitleSchema,
} from "./validation";

async function updateQuadrantTitle({
  quadrantId,
  title,
}: {
  quadrantId: string;
  title: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  await updateTopicQuadrant({ quadrantId, name: title });
}

export const updateQuadrantTitleAction = actionClient
  .schema(updateQuadrantTitleSchema)
  .bindArgsSchemas(bindEditQuadrantTitleSchemas)
  .action(
    async ({ parsedInput: { title }, bindArgsParsedInputs: [quadrantId] }) => {
      await updateQuadrantTitle({
        quadrantId,
        title,
      });

      // TODO: キャッシュヒットしてるっぽくて、更新されない = optimisticStateから元に戻ってしまう
      // https://next-safe-action.dev/docs/execute-actions/hooks/useoptimisticaction
      // https://www.npmjs.com/package/@next-safe-action/adapter-react-hook-form
      //   -> revalidatePathに対する説明
      revalidatePath(`/`);
      return {
        successful: true,
      };
    },
  );

export const saveQuadrantItemsAction = async (
  topicQuadrantsToItems: { quadrantId: string; bookmarkIds: string[] }[],
) => {
  await createOrUpdateTopicQuadrantsToBookmarks({
    topicQuadrantsToBookmarks: topicQuadrantsToItems,
  });
  revalidatePath(`/`);
  return {
    successful: true,
  };
};
