// src/components/DatasetTable.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type DatasetTableProps = {
    dataKeys: string[];
    records: {
        id: number;
        data: Record<string, unknown>;
    }[];
};

function toHeaderLabel(key: string) {
    return key
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DatasetTable({ dataKeys, records }: DatasetTableProps) {
    if (records.length === 0) {
        return (
            <p className="text-sm text-foreground">
                No records to display with the current filters.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border">
            <Table className="min-w-full text-xs">
                <TableHeader>
                    <TableRow className="border-border bg-muted/60">
                        <TableHead className="px-3 py-2 text-foreground">ID</TableHead>
                        {dataKeys.map((key) => (
                            <TableHead key={key} className="px-3 py-2 text-foreground">
                                {toHeaderLabel(key)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((rec) => (
                        <TableRow
                            key={rec.id}
                            className="border-border bg-muted/60"
                        >
                            <TableCell className="px-3 py-2 text-foreground">
                                {rec.id}
                            </TableCell>
                            {dataKeys.map((key) => (
                                <TableCell key={key} className="px-3 py-2 text-slate-100">
                                    {String(
                                        rec.data[key] === undefined || rec.data[key] === null
                                            ? ''
                                            : rec.data[key],
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
