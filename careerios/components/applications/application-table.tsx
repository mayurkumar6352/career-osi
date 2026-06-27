"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, ExternalLink, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/types";
import { cn, formatDate, formatSalaryRange } from "@/lib/utils";
import { deleteApplication } from "@/lib/actions/application.actions";
import { toast } from "sonner";
import type { Application } from "@/types";

interface ApplicationTableProps {
  applications: Application[];
  onEdit?: (app: Application) => void;
  onRefresh?: () => void;
}

export function ApplicationTable({ applications, onEdit, onRefresh }: ApplicationTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "company",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Company <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/dashboard/applications/${row.original.id}`} className="font-semibold hover:text-primary transition-colors">
          {row.getValue("company")}
        </Link>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Role",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("jobTitle")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof APPLICATION_STATUS_LABELS;
        return (
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", APPLICATION_STATUS_COLORS[status])}>
            {APPLICATION_STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const p = row.getValue("priority") as string;
        return (
          <span className={cn(
            "text-xs font-medium",
            p === "URGENT" ? "text-red-500" : p === "HIGH" ? "text-orange-500" : p === "MEDIUM" ? "text-blue-500" : "text-muted-foreground"
          )}>
            {p}
          </span>
        );
      },
    },
    {
      id: "salary",
      header: "Salary",
      cell: ({ row }) => {
        const app = row.original;
        if (!app.salaryMin && !app.salaryMax) return <span className="text-muted-foreground/50">—</span>;
        return <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatSalaryRange(app.salaryMin, app.salaryMax, app.salaryCurrency)}</span>;
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue("location") || "—"}</span>,
    },
    {
      accessorKey: "appliedDate",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Applied <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.getValue("appliedDate") || row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/applications/${row.original.id}`}>
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> View
              </Link>
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                const result = await deleteApplication(row.original.id);
                if (result.success) { toast.success("Deleted"); onRefresh?.(); }
                else toast.error(result.error);
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter applications..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No applications found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} applications
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
