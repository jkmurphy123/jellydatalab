// src/lib/datasetTypes.ts

export type ColumnType = 'string' | 'number' | 'date' | 'boolean';

export type FilterType = 'none' | 'select' | 'search' | 'range';

export type DatasetColumnConfig = {
    field: string;        // JSON key in Record.data (e.g. "job_title")
    label: string;        // UI label (e.g. "Job Title")
    type: ColumnType;     // for formatting & future filter widgets
    filter?: {
        type: FilterType;
        placeholder?: string;
    };
    sortable?: boolean;
    visible?: boolean;    // allow hiding internal columns later
    width?: number | string; // optional UI hint
};

export type DatasetConfig = {
    slug: string;         // e.g. "salary-2024"
    title: string;
    description?: string;
    sourceType: 'local' | 'api';
    columns: DatasetColumnConfig[];

    // optional when this dataset is API-backed
    apiConfig?: {
        baseUrl: string;
        method?: 'GET' | 'POST';
        filterParamMap?: Record<string, string>;
        pageParam?: string;
        pageSizeParam?: string;
        sortFieldParam?: string;
        sortDirParam?: string;
        idField?: string;
        resultPath?: string;
        totalPath?: string;
    };
};
