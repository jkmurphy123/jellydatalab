// src/app/datasets/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDatasetBySlug, getRecordsForDataset } from '@/lib/datasets';
import { DatasetGridPage } from '@/components/DatasetGridPage';
import { SalaryFilterPanel } from '@/components/SalaryFilterPanel';
import { SalaryAnalysis } from '@/components/SalaryAnalysis';
import { DynamicDataGrid } from '@/components/DynamicDataGrid';

import { getDatasetConfig } from '@/config/datasets';
import { RemoteDatasetGrid } from '@/components/RemoteDatasetGrid';

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

    // 1️⃣ NEW: check DatasetConfig first
    const config = getDatasetConfig(slug);

    // If this dataset is declared as API-backed, use the new API flow
    if (config && config.sourceType === 'api') {
        // Turn searchParams into a query string we can pass to RemoteDatasetGrid
        const qs = new URLSearchParams();
        Object.entries(search).forEach(([key, value]) => {
            if (typeof value === 'string') qs.set(key, value);
        });

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        <a href="/datasets" className="hover:text-primary">
                            ← Back to datasets
                        </a>
                    </p>
                    <h1 className="text-2xl font-bold text-foreground">
                        {config.title}
                    </h1>
                    {config.description && (
                        <p className="text-sm text-muted-foreground">
                            {config.description}
                        </p>
                    )}
                </div>

                {/* TODO: later, auto-generate filters from config.columns[*].filter */}

                <RemoteDatasetGrid slug={slug} queryString={qs.toString()} />
            </div>
        );
    }

    // 2️⃣ Existing: load dataset metadata from DB (for local datasets)
    const dataset = await getDatasetBySlug(slug);
    if (!dataset) {
        notFound();
    }

    // 3️⃣ Existing: special case for salary dataset
    if (slug === 'salary-2024') {
        return await renderSalaryDataset(
            dataset.id,
            slug,
            search,
            dataset.title,
            dataset.description,
            dataset.sourceUrl ?? undefined,
        );
    }

    // 4️⃣ Existing: generic renderer for all other local datasets
    return await renderGenericDataset(
        dataset.id,
        slug,
        search,
        dataset.title,
        dataset.description,
        dataset.sourceUrl ?? undefined,
    );
}

// ─────────────────────────────────────────────
// EXISTING salary-specific renderer (keep this)
// ─────────────────────────────────────────────

async function renderSalaryDataset(
    datasetId: number,
    slug: string,
    search: SearchParams,
    title: string,
    description?: string | null,
    sourceUrl?: string,
) {
    const yearParam = search?.year;
    const selectedYear =
        typeof yearParam === 'string' && yearParam.trim() !== ''
            ? Number.parseInt(yearParam, 10)
            : undefined;

    const expParam = search?.exp;
    const selectedExp =
        typeof expParam === 'string' && expParam.trim() !== ''
            ? expParam.trim()
            : undefined;

    const sizeParam = search?.size;
    const selectedSize =
        typeof sizeParam === 'string' && sizeParam.trim() !== ''
            ? sizeParam.trim()
            : undefined;

    const titleParam = search?.title;
    const titleFilter =
        typeof titleParam === 'string' && titleParam.trim() !== ''
            ? titleParam.trim().toLowerCase()
            : undefined;

    const minSalaryParam = search?.minSalary;
    const minSalary =
        typeof minSalaryParam === 'string' && minSalaryParam.trim() !== ''
            ? Number.parseFloat(minSalaryParam)
            : undefined;

    const maxSalaryParam = search?.maxSalary;
    const maxSalary =
        typeof maxSalaryParam === 'string' && maxSalaryParam.trim() !== ''
            ? Number.parseFloat(maxSalaryParam)
            : undefined;

    const allRecordsRaw = await getRecordsForDataset(datasetId, 5000);

    const allRecords = allRecordsRaw.map((rec) => ({
        id: rec.id,
        ...(rec.data as any),
    }));

    const yearSet = new Set<number>();
    const expSet = new Set<string>();
    const sizeSet = new Set<string>();

    for (const row of allRecords) {
        if (typeof row.work_year === 'number' && !Number.isNaN(row.work_year)) {
            yearSet.add(row.work_year);
        }
        if (typeof row.experience_level === 'string' && row.experience_level) {
            expSet.add(row.experience_level);
        }
        if (typeof row.company_size === 'string' && row.company_size) {
            sizeSet.add(row.company_size);
        }
    }

    const years = Array.from(yearSet).sort((a, b) => a - b);
    const experienceLevels = Array.from(expSet).sort((a, b) =>
        a.localeCompare(b),
    );
    const companySizes = Array.from(sizeSet).sort((a, b) =>
        a.localeCompare(b),
    );

    let filtered = allRecords;

    if (selectedYear != null && !Number.isNaN(selectedYear)) {
        filtered = filtered.filter((row) => row.work_year === selectedYear);
    }

    if (selectedExp) {
        filtered = filtered.filter(
            (row) => row.experience_level === selectedExp,
        );
    }

    if (selectedSize) {
        filtered = filtered.filter(
            (row) => row.company_size === selectedSize,
        );
    }

    if (titleFilter) {
        filtered = filtered.filter((row) =>
            typeof row.job_title === 'string'
                ? row.job_title.toLowerCase().includes(titleFilter)
                : false,
        );
    }

    if (minSalary != null && !Number.isNaN(minSalary)) {
        filtered = filtered.filter((row) => {
            const s = row.salary_in_usd;
            return typeof s === 'number' && s >= minSalary;
        });
    }

    if (maxSalary != null && !Number.isNaN(maxSalary)) {
        filtered = filtered.filter((row) => {
            const s = row.salary_in_usd;
            return typeof s === 'number' && s <= maxSalary;
        });
    }

    const flatRows = filtered.map((row) => row);

    const sample = flatRows[0] as Record<string, unknown> | undefined;

    // 🔹 Try to use DatasetConfig first
    const config = getDatasetConfig(slug);

    const dataKeys = config
        ? config.columns
            .filter((c) => c.visible !== false && c.field !== 'id')
            .map((c) => c.field)
        : (() => {
            // Fallback to old behavior if config missing for some reason
            const sample = flatRows[0] as Record<string, unknown> | undefined;
            return sample
                ? Object.keys(sample).filter((k) => k !== 'id')
                : [];
        })();

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                    <a href="/datasets" className="hover:text-primary">
                        ← Back to datasets
                    </a>
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

            <SalaryFilterPanel
                slug={slug}
                years={years}
                experienceLevels={experienceLevels}
                companySizes={companySizes}
            />

            <SalaryAnalysis rows={flatRows as any} />

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">
                    Records ({flatRows.length})
                </h2>
                <DynamicDataGrid data={flatRows as any} dataKeys={dataKeys} />
            </section>
        </div>
    );
}

// ─────────────────────────────────────────────
// EXISTING generic renderer (keep this too)
// ─────────────────────────────────────────────

async function renderGenericDataset(
    datasetId: number,
    slug: string,
    _search: SearchParams,
    title: string,
    description?: string | null,
    sourceUrl?: string,
) {
    const allRecordsRaw = await getRecordsForDataset(datasetId, 2000);

    const allRecords = allRecordsRaw.map((rec) => ({
        id: rec.id,
        ...(rec.data as any),
    }));

    const years: number[] = [];
    const states: string[] = [];

    return (
        <DatasetGridPage
            slug={slug}
            title={title}
            description={description ?? undefined}
            sourceUrl={sourceUrl}
            years={years}
            states={states}
            rows={allRecords}
        />
    );
}
