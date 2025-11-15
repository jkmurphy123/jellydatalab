// src/app/datasets/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDatasetBySlug, getRecordsForDataset } from '@/lib/datasets';
import { DatasetFilterPanel } from '@/components/DatasetFilterPanel';
import { DatasetTable } from '@/components/DatasetTable';

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

    const sortKeyParam = search?.sortKey;
    const sortKey =
        typeof sortKeyParam === 'string' && sortKeyParam.trim() !== ''
            ? sortKeyParam.trim()
            : undefined;

    const sortDirParam = search?.sortDir;
    const sortDir: 'asc' | 'desc' =
        sortDirParam === 'desc' || sortDirParam === 'ASC'
            ? 'desc'
            : 'asc';

    const allRecordsRaw = await getRecordsForDataset(dataset.id, 1000);

    const allRecords = allRecordsRaw.map((rec) => ({
        id: rec.id,
        data: rec.data as Record<string, unknown>,
    }));

    // Build distinct years & states
    const yearSet = new Set<number>();
    const stateSet = new Set<string>();

    for (const rec of allRecords) {
        const yr = rec.data.year;
        if (typeof yr === 'number' && !Number.isNaN(yr)) yearSet.add(yr);

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

    // Determine columns
    const sample =
        filtered.length > 0
            ? filtered[0]
            : allRecords.length > 0
                ? allRecords[0]
                : undefined;

    const dataKeys = sample ? Object.keys(sample.data) : [];
    const sortableKeys = dataKeys;

    // Apply sorting
    const records = [...filtered];

    if (sortKey && sortableKeys.includes(sortKey)) {
        records.sort((a, b) => {
            const va = a.data[sortKey];
            const vb = b.data[sortKey];

            if (va == null && vb == null) return 0;
            if (va == null) return sortDir === 'asc' ? -1 : 1;
            if (vb == null) return sortDir === 'asc' ? 1 : -1;

            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDir === 'asc' ? va - vb : vb - va;
            }

            const sa = String(va);
            const sb = String(vb);
            const cmp = sa.localeCompare(sb, 'en', { sensitivity: 'base' });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }

    return (
        <div className="space-y-6">
            {/* Header / meta */}
            <div className="space-y-2">
                <p className="text-xs text-slate-400">
                    <Link href="/datasets" className="hover:text-emerald-300">
                        ← Back to datasets
                    </Link>
                </p>
                <h1 className="text-2xl font-bold text-slate-50">{dataset.title}</h1>
                <p className="text-sm text-slate-300">{dataset.description}</p>
                {dataset.sourceUrl && (
                    <p className="text-xs text-slate-400">
                        Source:{' '}
                        <a
                            href={dataset.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300"
                        >
                            {dataset.sourceUrl}
                        </a>
                    </p>
                )}
            </div>

            {/* Filters + sorting (client component) */}
            <DatasetFilterPanel
                slug={slug}
                years={years}
                states={states}
                sortableKeys={sortableKeys}
            />

            {/* Records table */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-200">
                    Records ({records.length})
                </h2>
                <DatasetTable dataKeys={dataKeys} records={records} />
            </section>
        </div>
    );
}
