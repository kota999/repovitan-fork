"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createOrUpdateTopicQuadrantsToBookmarks,
  createTopicMemo,
  updateTopicQuadrant,
} from "~/db/mutation";
import { actionClient } from "~/lib/safe-action";
import {
  bindEditQuadrantTitleSchemas,
  updateQuadrantTitleSchema,
} from "./validation";
import type { ItemContentType } from "./components/item-card";

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
  topicQuadrantsToItems: {
    quadrantId: string;
    items: { itemId: string; itemType: ItemContentType }[];
  }[],
) => {
  await createOrUpdateTopicQuadrantsToBookmarks({
    topicQuadrantsToItems: topicQuadrantsToItems,
  });
  revalidatePath("/dashboard/bookmark-topics");
  return {
    successful: true,
  };
};

export const createTopicMemoAction = async ({
  topicId,
  memo,
}: {
  topicId: string;
  memo: string;
}) => {
  await createTopicMemo({ topicId, memo });
  // TODO: revalidatePathが効いてない？？
  revalidatePath("/dashboard/bookmark-topics");
  return {
    successful: true,
  };
};
