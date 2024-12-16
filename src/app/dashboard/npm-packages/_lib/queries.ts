import "server-only";

import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { db } from "~/db";
import {
  nodejsProjectsToNpmPackagesTable,
  npmPackagesTable,
} from "~/db/schema";
import type { GetNpmPackagesSchema } from "./validations";

const sq = db
  .select({
    id: npmPackagesTable.id,
    name: npmPackagesTable.name,
    count: count().as("count"),
  })
  .from(nodejsProjectsToNpmPackagesTable)
  .innerJoin(
    npmPackagesTable,
    eq(nodejsProjectsToNpmPackagesTable.packageId, npmPackagesTable.id),
  )
  .groupBy(nodejsProjectsToNpmPackagesTable.packageId)
  .as("sq");

export type NpmPackage = {
  id: string;
  name: string;
  count: number;
};

export async function getNpmPackages(input: GetNpmPackagesSchema) {
  try {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
      input.name ? like(sq.name, `%${input.name}%`) : undefined,
    );

    const orderBy =
      input.sort.length > 0
        ? input.sort.map((item) =>
            item.desc ? desc(sq[item.id]) : asc(sq[item.id]),
          )
        : [asc(sq.name)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(sq)
        .limit(input.perPage)
        .offset(offset)
        .where(where)
        .orderBy(...orderBy);

      const total = await tx
        .select({
          count: count(),
        })
        .from(sq)
        .where(where)
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}
