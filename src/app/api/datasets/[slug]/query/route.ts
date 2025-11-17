// src/app/api/datasets/[slug]/query/route.ts
import { NextResponse } from 'next/server';
import { getProviderForSlug } from '@/lib/datasetProviderRegistry';
import type { DatasetQuery, DatasetQueryFilter } from '@/lib/datasetProvider';

type RouteParams = { slug: string };

export async function GET(
    req: Request,
    context: { params: RouteParams },
) {
    const { slug } = context.params;
    const url = new URL(req.url);

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');

    // Generic filter parsing (you can customize per dataset later)
    const filters: DatasetQueryFilter[] = [];

    // naive pattern: ?field=foo becomes an eq filter; you can expand this to read min/max/search
    url.searchParams.forEach((value, key) => {
        if (['page', 'pageSize', 'sortField', 'sortDir'].includes(key)) {
            return;
        }
        if (key.endsWith('_min')) {
            const field = key.replace(/_min$/, '');
            filters.push({ field, op: 'gte', value: Number(value) });
        } else if (key.endsWith('_max')) {
            const field = key.replace(/_max$/, '');
            filters.push({ field, op: 'lte', value: Number(value) });
        } else if (key.endsWith('_contains')) {
            const field = key.replace(/_contains$/, '');
            filters.push({ field, op: 'contains', value });
        } else {
            filters.push({ field: key, op: 'eq', value });
        }
    });

    const sortField = url.searchParams.get('sortField');
    const sortDir = url.searchParams.get('sortDir');
    const sort =
        sortField && sortDir
            ? {
                field: sortField,
                direction: sortDir === 'desc' ? 'desc' : 'asc',
            }
            : undefined;

    const query: DatasetQuery = {
        filters,
        sort,
        page,
        pageSize,
    };

    const { provider } = await getProviderForSlug(slug);
    const result = await provider.list(query);

    return NextResponse.json(result);
}
