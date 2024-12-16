"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Checkbox } from "~/components/ui/checkbox";
import type { NpmPackage } from "../_lib/queries";

export function getColumns(): ColumnDef<NpmPackage>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 24,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Link
              href={`/dashboard/npm-packages/${row.original.id}`}
              className="max-w-[31.25rem] truncate font-medium"
            >
              {row.getValue("name")}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Count" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("count")}
            </span>
          </div>
        );
      },
    },
  ];
}
