"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { authActionClient } from "~/lib/safe-action";
import {
  createNodejsRequirePackageSchema,
  deleteNodejsRequirePackageSchema,
} from "./validation";
import { nodejsProjectRequirePackageTable } from "~/db/schema";
import { eq } from "drizzle-orm";

async function createNodejsRequirePackage({
  userId,
  packageName,
}: {
  userId: string;
  packageName: string;
}) {
  await db
    .insert(nodejsProjectRequirePackageTable)
    .values({
      userId,
      packageName,
    })
    .onConflictDoNothing();
}

export const createNodejsRequirePackageAction = authActionClient
  .schema(createNodejsRequirePackageSchema)
  .action(
    async ({
      ctx: { userId },
      parsedInput: { packageName },
    }: {
      ctx: { userId: string };
      parsedInput: { packageName: string };
    }) => {
      await createNodejsRequirePackage({
        userId: userId,
        packageName: packageName,
      });

      revalidatePath("/dashboard/bookmarks/nodejs-require");
      return {
        successful: true,
      };
    },
  );

async function deleteNodejsRequirePackage({
  packageId,
}: {
  packageId: string;
}) {
  await db
    .delete(nodejsProjectRequirePackageTable)
    .where(eq(nodejsProjectRequirePackageTable.id, packageId));
}

export const deleteNodejsRequirePackageAction = async (packageId: string) => {
  const parsedInput = deleteNodejsRequirePackageSchema.safeParse({
    packageId: packageId,
  });
  if (parsedInput.error) {
    return {
      success: false,
    };
  }

  await deleteNodejsRequirePackage({
    packageId: packageId,
  });

  revalidatePath("/dashboard/auto-taggings");

  return {
    successful: true,
  };
};
