// src/lib/datasets.ts
import { prisma } from './prisma';

export async function getAllDatasets() {
    return prisma.dataset.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getDatasetBySlug(slug: string) {
    return prisma.dataset.findUnique({
        where: { slug },
    });
}

export async function getRecordsForDataset(datasetId: number, limit = 20) {
    return prisma.record.findMany({
        where: { datasetId },
        orderBy: { id: 'asc' },
        take: limit,
    });
}
