"use client";

import * as React from "react";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { useDataTable } from "~/hooks/use-data-table";
import type { DataTableFilterField } from "~/types";
import type { getNpmPackages, NpmPackage } from "../_lib/queries";
import { getColumns } from "./npm-packages-table-columns";

interface NpmPackagesTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getNpmPackages>>]>;
}

export function NpmPackagesTable({ promises }: NpmPackagesTableProps) {
  const [{ data, pageCount }] = React.use(promises);

  const columns = React.useMemo(() => getColumns(), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<NpmPackage>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter names...",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "count", desc: true }],
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar
          table={table}
          filterFields={filterFields}
        ></DataTableToolbar>
      </DataTable>
    </>
  );
}
