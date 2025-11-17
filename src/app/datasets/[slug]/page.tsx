// src/app/datasets/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getDatasetBySlug, getRecordsForDataset } from '@/lib/datasets';
import { DatasetGridPage } from '@/components/DatasetGridPage'; // your existing generic layout
import { SalaryFilterPanel } from '@/components/SalaryFilterPanel';
import { SalaryAnalysis } from '@/components/SalaryAnalysis';
import { DynamicDataGrid } from '@/components/DynamicDataGrid';

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

    // Special-case: salary dataset
    if (slug === 'salary-2024') {
        return await renderSalaryDataset(dataset.id, slug, search, dataset.title, dataset.description, dataset.sourceUrl ?? undefined);
    }

    // Fallback: generic layout for other datasets
    return await renderGenericDataset(dataset.id, slug, search, dataset.title, dataset.description, dataset.sourceUrl ?? undefined);
}

// ---------- Salary-specific renderer ----------

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

    // Distinct filter values
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

    // Apply filters
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

    // Flat rows for grid
    const flatRows = filtered.map((row) => row);

    const sample = flatRows[0] as Record<string, unknown> | undefined;
    const dataKeys = sample
        ? Object.keys(sample).filter((k) => k !== 'id')
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                    {/* back link is inside DatasetGridPage in generic case, but here we inline it */}
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

            {/* Filters */}
            <SalaryFilterPanel
                slug={slug}
                years={years}
                experienceLevels={experienceLevels}
                companySizes={companySizes}
            />

            {/* Analysis widgets */}
            <SalaryAnalysis rows={flatRows as any} />

            {/* Data grid */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">
                    Records ({flatRows.length})
                </h2>
                <DynamicDataGrid data={flatRows as any} dataKeys={dataKeys} />
            </section>
        </div>
    );
}

// ---------- Generic renderer for all other datasets ----------

async function renderGenericDataset(
    datasetId: number,
    slug: string,
    search: SearchParams,
    title: string,
    description?: string | null,
    sourceUrl?: string,
) {
    // You can reuse your previous generic logic here;
    // simplest version: ignore searchParams for now and just re-use DatasetGridPage.

    const allRecordsRaw = await getRecordsForDataset(datasetId, 2000);

    const allRecords = allRecordsRaw.map((rec) => ({
        id: rec.id,
        ...(rec.data as any),
    }));

    // If your generic page uses year/state, you can compute those here;
    // for now we'll just pass empty arrays so it still renders.

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
