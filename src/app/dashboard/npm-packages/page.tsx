import { and, count, desc, eq, like, type SQL } from "drizzle-orm";
import { db } from "~/db";
import { nodejsProjectsToNpmPackages, npmPackagesTable } from "~/db/schema";

export const dynamic = "force-dynamic";

export default async function NpmPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const where: SQL[] = [];
  const { q } = await searchParams;
  if (q) {
    where.push(like(npmPackagesTable.name, `%${q}%`));
  }

  const npmPackages = await db
    .select({
      id: nodejsProjectsToNpmPackages.packageId,
      name: npmPackagesTable.name,
      count: count(),
    })
    .from(nodejsProjectsToNpmPackages)
    .innerJoin(
      npmPackagesTable,
      eq(nodejsProjectsToNpmPackages.packageId, npmPackagesTable.id),
    )
    .where(and(...where))
    .groupBy(nodejsProjectsToNpmPackages.packageId)
    .orderBy(desc(count()))
    .limit(10);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ul>
        {npmPackages.map(({ id, name, count }) => (
          <li key={id}>
            {name} ({count})
          </li>
        ))}
      </ul>
    </div>
  );
}
