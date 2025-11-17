// src/components/RemoteDatasetGrid.tsx
'use client';

import * as React from 'react';
import { DynamicDataGrid } from './DynamicDataGrid';

type RemoteDatasetGridProps = {
    slug: string;
    initialDataKeys: string[]; // or fetch them dynamically
    queryString: string;       // e.g. 'year=2024&category=Books'
};

export function RemoteDatasetGrid({
    slug,
    initialDataKeys,
    queryString,
}: RemoteDatasetGridProps) {
    const [rows, setRows] = React.useState<any[]>([]);
    const [total, setTotal] = React.useState(0);

    React.useEffect(() => {
        async function load() {
            const res = await fetch(
                `/api/datasets/${slug}/query?${queryString}`,
            );
            const json = await res.json();
            setRows(json.rows ?? []);
            setTotal(json.total ?? 0);
        }
        load();
    }, [slug, queryString]);

    return (
        <div className="space-y-2">
            <DynamicDataGrid data={rows} dataKeys={initialDataKeys} />
            <p className="text-[11px] text-muted-foreground">
                Total records: {total}
            </p>
        </div>
    );
}
