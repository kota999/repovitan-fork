import { eq } from "drizzle-orm";

import { db } from ".";
import {
  bookmarkTopicsTable,
  bookmarkTopicsToTopicMemosTable,
  topicMemosTable,
  topicQuadrantsTable,
  topicQuadrantsToItemsTable,
  usersTable,
} from "./schema";
import type { ItemContentType } from "~/app/dashboard/bookmark-topics/[bookmarkTopicId]/components/item-card";

export const createUser = async (userId: string, username: string) => {
  await db.transaction(async (tx) => {
    await tx
      .insert(usersTable)
      .values({ id: userId, username: username })
      .onConflictDoNothing();
  });
};

export const createBookmarkTopic = async (userId: string, name: string) => {
  await db.transaction(async (tx) => {
    const createTopicQuadrant = async (name: string) => {
      const resultSet = await tx
        .insert(topicQuadrantsTable)
        .values({ userId, name })
        .returning({ insertedId: topicQuadrantsTable.id });
      return resultSet[0]?.insertedId ?? "";
    };
    const quadrant1Id = await createTopicQuadrant("Quadrant1");
    const quadrant2Id = await createTopicQuadrant("Quadrant2");
    const quadrant3Id = await createTopicQuadrant("Quadrant3");
    const quadrant4Id = await createTopicQuadrant("Quadrant4");

    await tx.insert(bookmarkTopicsTable).values({
      userId,
      name,
      icon: "",
      quadrant1Id,
      quadrant2Id,
      quadrant3Id,
      quadrant4Id,
    });
  });
};

export const updateTopicQuadrant = async ({
  quadrantId,
  name,
}: {
  quadrantId: string;
  name: string;
}) => {
  await db.transaction(async (tx) => {
    await tx
      .update(topicQuadrantsTable)
      .set({ name })
      .where(eq(topicQuadrantsTable.id, quadrantId));
  });
};

export const createOrUpdateTopicQuadrantsToBookmarks = async ({
  topicQuadrantsToItems,
}: {
  topicQuadrantsToItems: {
    quadrantId: string;
    items: { itemId: string; itemType: ItemContentType }[];
  }[];
}) => {
  await db.transaction(async (tx) => {
    await Promise.all(
      topicQuadrantsToItems.map(async (tq2b) => {
        // delete if exist some records
        await tx
          .delete(topicQuadrantsToItemsTable)
          .where(eq(topicQuadrantsToItemsTable.quadrantId, tq2b.quadrantId));
        // inset records
        await Promise.all(
          tq2b.items.map(async (item, idx) => {
            await tx.insert(topicQuadrantsToItemsTable).values({
              quadrantId: tq2b.quadrantId,
              itemId: item.itemId,
              itemType: item.itemType,
              position: idx,
            });
          }),
        );
      }),
    );
  });
};

export const createTopicMemo = async ({
  userId,
  topicId,
  memo,
}: {
  userId: string;
  topicId: string;
  memo: string;
}) => {
  let memoId = "";
  await db.transaction(async (tx) => {
    const resultSet = await tx
      .insert(topicMemosTable)
      .values({ userId: userId, content: memo })
      .returning({ memoId: topicMemosTable.id });
    memoId = resultSet[0]?.memoId ?? "";
    await tx.insert(bookmarkTopicsToTopicMemosTable).values({
      topicId: topicId,
      memoId: memoId,
    });
  });
  return memoId;
};
