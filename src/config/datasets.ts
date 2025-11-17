// src/config/datasets.ts
import type { DatasetConfig } from '@/lib/datasetTypes';

export const DATASET_CONFIGS: DatasetConfig[] = [
    // Example API-backed dataset
    {
        slug: 'products-demo',
        title: 'Demo Products (API)',
        description: 'Products listing backed by an external API.',
        sourceType: 'api',
        columns: [
            {
                field: 'id',
                label: 'ID',
                type: 'number',
                sortable: true,
            },
            {
                field: 'name',
                label: 'Name',
                type: 'string',
                filter: { type: 'search', placeholder: 'Search by name' },
                sortable: true,
            },
            {
                field: 'category',
                label: 'Category',
                type: 'string',
                filter: { type: 'select' },
                sortable: true,
            },
            {
                field: 'price',
                label: 'Price',
                type: 'number',
                filter: { type: 'range' },
                sortable: true,
            },
            {
                field: 'currency',
                label: 'Currency',
                type: 'string',
            },
            {
                field: 'rating',
                label: 'Rating',
                type: 'number',
            },
            {
                field: 'stock',
                label: 'Stock',
                type: 'number',
            },
        ],
        apiConfig: {
            baseUrl: 'https://api.example.com/products',
            method: 'GET',
            filterParamMap: {
                name: 'search',
                category: 'category',
                price_min: 'minPrice', // we'll synthesize price_min/price_max from filters
                price_max: 'maxPrice',
            },
            pageParam: 'page',
            pageSizeParam: 'pageSize',
            sortFieldParam: 'sort',
            sortDirParam: 'order',
            idField: 'id',
            resultPath: 'items', // json.items
            totalPath: 'total',  // json.total
        },
    },
];

export function getDatasetConfig(slug: string): DatasetConfig | undefined {
    return DATASET_CONFIGS.find((d) => d.slug === slug);
}
