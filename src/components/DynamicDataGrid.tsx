// src/components/DynamicDataGrid.tsx
'use client';

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type RowData = {
    id: number;
} & Record<string, unknown>;

type DynamicDataGridProps = {
    data: RowData[];
    dataKeys: string[]; // keys from the JSON data (e.g. ['state','year','population'])
};

function toHeaderLabel(key: string) {
    return key
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DynamicDataGrid({ data, dataKeys }: DynamicDataGridProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    // Build columns dynamically from the data keys
    const columns = React.useMemo<ColumnDef<RowData, any>[]>(() => {
        const cols: ColumnDef<RowData, any>[] = [];

        // First column: ID
        cols.push({
            accessorKey: 'id',
            header: ({ column }) => (
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    ID
                    <SortIndicator state={column.getIsSorted()} />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {row.getValue('id') as number}
                </span>
            ),
        });

        // Data columns
        for (const key of dataKeys) {
            cols.push({
                accessorKey: key,
                header: ({ column }) => (
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        {toHeaderLabel(key)}
                        <SortIndicator state={column.getIsSorted()} />
                    </button>
                ),
                cell: ({ row }) => {
                    const value = row.getValue(key);
                    return (
                        <span className="text-xs text-foreground">
                            {value === null || value === undefined ? '' : String(value)}
                        </span>
                    );
                },
            });
        }

        return cols;
    }, [dataKeys]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 25,
            },
        },
    });

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border">
                <Table className="min-w-full text-xs">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-border bg-muted/50"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-3 py-2 text-xs text-muted-foreground"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="px-3 py-4 text-center text-xs text-muted-foreground"
                                >
                                    No records to display.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-border hover:bg-muted/40"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-3 py-2 text-xs align-top"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div>
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount() || 1}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Prev
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SortIndicator({ state }: { state: false | 'asc' | 'desc' }) {
    if (state === 'asc') return <span>↑</span>;
    if (state === 'desc') return <span>↓</span>;
    return <span className="opacity-30">↕</span>;
}
