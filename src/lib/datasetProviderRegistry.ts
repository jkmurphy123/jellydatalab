// src/lib/datasetProviderRegistry.ts
import { getDatasetConfig } from '@/config/datasets';
import { makeApiDatasetProvider } from './datasetProvider';
import type {
    DatasetProvider,
    DatasetResult,
    DatasetQuery,
} from './datasetProvider';

// If you want, you can still use Prisma for local datasets:
import { prisma } from '@/lib/prisma';

const prismaLocalProvider: DatasetProvider = {
    async list(query: DatasetQuery): Promise<DatasetResult> {
        // Minimal example: no advanced filtering
        const [rows, total] = await Promise.all([
            prisma.record.findMany({
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
                orderBy: undefined,
            }),
            prisma.record.count(),
        ]);

        return {
            rows: rows.map((r) => ({
                id: r.id,
                data: r.data as Record<string, unknown>,
            })),
            total,
        };
    },
};

export async function getProviderForSlug(
    slug: string,
): Promise<{ provider: DatasetProvider; config: ReturnType<typeof getDatasetConfig> }> {
    const config = getDatasetConfig(slug);

    if (config && config.sourceType === 'api') {
        return { provider: makeApiDatasetProvider(config), config };
    }

    // fallback to local DB for now
    return { provider: prismaLocalProvider, config };
}
