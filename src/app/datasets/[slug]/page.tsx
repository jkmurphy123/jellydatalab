// src/app/datasets/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDatasetBySlug, getRecordsForDataset } from '@/lib/datasets';
import { DatasetGridPage } from '@/components/DatasetGridPage';

type RouteParams = {
    slug: string;
};

type SearchParams = {
    [key: string]: string | string[] | undefined;
};

type Props = {
    params: Promise<RouteParams>;
    searchParams: Promise<SearchParams>;
};

export default async function DatasetDetailPage({
    params,
    searchParams,
}: Props) {
    const { slug } = await params;
    const search = await searchParams;

    const dataset = await getDatasetBySlug(slug);
    if (!dataset) {
        notFound();
    }

    // Filters from query string
    const yearParam = search?.year;
    const selectedYear =
        typeof yearParam === 'string' && yearParam.trim() !== ''
            ? Number.parseInt(yearParam, 10)
            : undefined;

    const stateParam = search?.state;
    const selectedState =
        typeof stateParam === 'string' && stateParam.trim() !== ''
            ? stateParam.trim()
            : undefined;

    // Fetch records (limit for now; later this can be real pagination)
    const allRecordsRaw = await getRecordsForDataset(dataset.id, 2000);

    const allRecords = allRecordsRaw.map((rec) => ({
        id: rec.id,
        data: rec.data as Record<string, unknown>,
    }));

    // Distinct years & states
    const yearSet = new Set<number>();
    const stateSet = new Set<string>();

    for (const rec of allRecords) {
        const yr = rec.data.year;
        if (typeof yr === 'number' && !Number.isNaN(yr)) {
            yearSet.add(yr);
        }

        const st = rec.data.state;
        if (typeof st === 'string' && st.trim() !== '') {
            stateSet.add(st.trim());
        }
    }

    const years = Array.from(yearSet).sort((a, b) => a - b);
    const states = Array.from(stateSet).sort((a, b) =>
        a.localeCompare(b, 'en', { sensitivity: 'base' }),
    );

    // Apply filters
    let filtered = allRecords;

    if (selectedYear != null && !Number.isNaN(selectedYear)) {
        filtered = filtered.filter((rec) => rec.data.year === selectedYear);
    }

    if (selectedState) {
        const target = selectedState.toLowerCase();
        filtered = filtered.filter((rec) => {
            const st = typeof rec.data.state === 'string' ? rec.data.state : '';
            return st.toLowerCase() === target;
        });
    }

    // Flatten into { id, ...data } rows for the grid
    const flatRows = filtered.map((rec) => ({
        id: rec.id,
        ...rec.data,
    }));

    return (
        <DatasetGridPage
            slug={slug}
            title={dataset.title}
            description={dataset.description}
            sourceUrl={dataset.sourceUrl ?? undefined}
            years={years}
            states={states}
            rows={flatRows}
        />
    );
}
