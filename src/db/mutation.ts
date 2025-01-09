import { eq } from "drizzle-orm";

import { db } from ".";
import {
  bookmarkTopicsTable,
  bookmarkTopicsToTopicMemosTable,
  topicMemosTable,
  topicQuadrantsToItemsTable,
  topicQuadrantTable,
} from "./schema";
import type { ItemContentType } from "~/app/dashboard/bookmark-topics/[bookmarkTopicId]/components/item-card";

export const createBookmarkTopic = async (userId: string, name: string) => {
  await db.transaction(async (tx) => {
    const createTopicQuadrant = async (name: string) => {
      const resultSet = await tx
        .insert(topicQuadrantTable)
        .values({ name })
        .returning({ insertedId: topicQuadrantTable.id });
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
    // TODO: 画面更新が上手くいかなかった件で試したが、意味なかったので一旦なし
    //const topic = await tx.query.bookmarkTopicsTable.findFirst({
    //  where: (bookmarkTopicsTable, { eq, or }) =>
    //    or(
    //      eq(bookmarkTopicsTable.quadrant1Id, quadrantId),
    //      eq(bookmarkTopicsTable.quadrant2Id, quadrantId),
    //      eq(bookmarkTopicsTable.quadrant3Id, quadrantId),
    //      eq(bookmarkTopicsTable.quadrant4Id, quadrantId),
    //    ),
    //})
    //if(!topic) return //error

    await tx
      .update(topicQuadrantTable)
      .set({ name })
      .where(eq(topicQuadrantTable.id, quadrantId));
    // TODO: 画面更新が上手くいかなかった件で試したが、意味なかったので一旦なし
    //await tx
    //  .update(bookmarkTopicsTable)
    //  .set({updatedAt: new Date()})
    //  .where(eq(bookmarkTopicsTable.id, topic.id))
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
  topicId,
  memo,
}: {
  topicId: string;
  memo: string;
}) => {
  await db.transaction(async (tx) => {
    const resultSet = await tx
      .insert(topicMemosTable)
      .values({ content: memo })
      .returning({ memoId: topicMemosTable.id });
    const memoId = resultSet[0]?.memoId ?? "";
    await tx.insert(bookmarkTopicsToTopicMemosTable).values({
      topicId: topicId,
      memoId: memoId,
    });
  });
};
