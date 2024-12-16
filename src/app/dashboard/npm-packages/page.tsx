import * as React from "react";
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton";
import type { SearchParams } from "~/types";
import { NpmPackagesTable } from "./_components/npm-packages-table";
import { getNpmPackages } from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

export const dynamic = "force-dynamic";

export default async function NpmPackagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const search = await searchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getNpmPackages({
      ...search,
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <NpmPackagesTable promises={promises} />
      </React.Suspense>
    </div>
  );
}
