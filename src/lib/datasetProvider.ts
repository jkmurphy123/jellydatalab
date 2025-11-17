// src/lib/datasetProvider.ts
import type {
    DatasetConfig,
    DatasetColumnConfig,
} from '@/lib/datasetTypes';

export type DatasetQueryFilterOp = 'eq' | 'contains' | 'gte' | 'lte';

export type DatasetQueryFilter = {
    field: string;
    op: DatasetQueryFilterOp;
    value: unknown;
};

export type DatasetQuery = {
    filters: DatasetQueryFilter[];
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    page: number;
    pageSize: number;
};

export type DatasetResultRow = {
    id: string | number;
    data: Record<string, unknown>;
};

export type DatasetResult = {
    rows: DatasetResultRow[];
    total: number;
};

export interface DatasetProvider {
    list(query: DatasetQuery): Promise<DatasetResult>;
}

// API provider from config
export function makeApiDatasetProvider(
    config: DatasetConfig,
): DatasetProvider {
    if (!config.apiConfig) {
        throw new Error('API dataset missing apiConfig');
    }
    const api = config.apiConfig;

    return {
        async list(query: DatasetQuery): Promise<DatasetResult> {
            const url = new URL(api.baseUrl);

            // pagination
            const pageParam = api.pageParam ?? 'page';
            const pageSizeParam = api.pageSizeParam ?? 'pageSize';
            url.searchParams.set(pageParam, String(query.page));
            url.searchParams.set(pageSizeParam, String(query.pageSize));

            // filters
            for (const f of query.filters) {
                const mapping = api.filterParamMap ?? {};
                // For ranges, we might synthesize suffixes like "_min"/"_max"
                let paramName = mapping[f.field];
                let value = f.value;

                if (!paramName) {
                    // If not explicitly mapped, just use field name
                    paramName = f.field;
                }

                if (f.op === 'contains') {
                    // simple case: search param
                    url.searchParams.set(paramName, String(value));
                } else if (f.op === 'eq') {
                    url.searchParams.set(paramName, String(value));
                } else if (f.op === 'gte') {
                    const minKey = mapping[`${f.field}_min`] ?? `${paramName}_min`;
                    url.searchParams.set(minKey, String(value));
                } else if (f.op === 'lte') {
                    const maxKey = mapping[`${f.field}_max`] ?? `${paramName}_max`;
                    url.searchParams.set(maxKey, String(value));
                }
            }

            // sort
            if (query.sort) {
                const sortFieldParam = api.sortFieldParam ?? 'sort';
                const sortDirParam = api.sortDirParam ?? 'order';
                url.searchParams.set(sortFieldParam, query.sort.field);
                url.searchParams.set(sortDirParam, query.sort.direction);
            }

            const res = await fetch(url.toString(), {
                method: api.method ?? 'GET',
            });

            if (!res.ok) {
                throw new Error(`API error ${res.status}`);
            }

            const json: any = await res.json();

            // Drill into resultPath
            let items: any = json;
            if (api.resultPath) {
                for (const key of api.resultPath.split('.')) {
                    items = items?.[key];
                }
            }

            let total: any = items?.length ?? 0;
            if (api.totalPath) {
                let t: any = json;
                for (const key of api.totalPath.split('.')) {
                    t = t?.[key];
                }
                if (typeof t === 'number') {
                    total = t;
                }
            }

            const idField = api.idField ?? 'id';

            const rows: DatasetResultRow[] = (items ?? []).map((item: any) => ({
                id: item[idField],
                data: item as Record<string, unknown>,
            }));

            return { rows, total };
        },
    };
}
