// src/components/DatasetGridPage.tsx
import Link from 'next/link';
import { DatasetFilterPanel } from '@/components/DatasetFilterPanel';
import { DynamicDataGrid } from '@/components/DynamicDataGrid';

type DatasetGridPageProps = {
    slug: string;
    title: string;
    description?: string | null;
    sourceUrl?: string | null;
    years: number[];
    states: string[];
    rows: ({ id: number } & Record<string, unknown>)[];
};

export function DatasetGridPage({
    slug,
    title,
    description,
    sourceUrl,
    years,
    states,
    rows,
}: DatasetGridPageProps) {
    // Determine data keys from the first row (excluding id)
    const sample = rows[0] as Record<string, unknown> | undefined;
    const dataKeys = sample
        ? Object.keys(sample).filter((k) => k !== 'id')
        : [];

    return (
        <div className="space-y-6">
            {/* Header / meta */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                    <Link href="/datasets" className="hover:text-primary">
                        ← Back to datasets
                    </Link>
                </p>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {sourceUrl && (
                    <p className="text-xs text-muted-foreground">
                        Source:{' '}
                        <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                        >
                            {sourceUrl}
                        </a>
                    </p>
                )}
            </div>

            {/* Filters (year + state) */}
            <DatasetFilterPanel slug={slug} years={years} states={states} />

            {/* Data grid */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">
                    Records ({rows.length})
                </h2>
                <DynamicDataGrid data={rows} dataKeys={dataKeys} />
            </section>
        </div>
    );
}
