import * as React from "react";
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton";
import { getValidFilters } from "~/lib/data-table";
import { type SearchParams } from "~/types";
import { TasksTable } from "./_components/tasks-table";
import {
  getTaskPriorityCounts,
  getTasks,
  getTaskStatusCounts,
} from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getTasks({
      ...search,
      filters: validFilters,
    }),
    getTaskStatusCounts(),
    getTaskPriorityCounts(),
  ]);

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
        <TasksTable promises={promises} />
      </React.Suspense>
    </section>
  );
}
