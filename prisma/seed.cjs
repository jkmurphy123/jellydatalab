// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo data...');

    // Clear existing data (dev only)
    await prisma.record.deleteMany();
    await prisma.dataset.deleteMany();

    const cityDataset = await prisma.dataset.create({
        data: {
            slug: 'city-populations-demo',
            title: 'City Populations (Demo)',
            description:
                'A tiny sample dataset of cities and their populations, used for testing JellyDataLab.',
            sourceUrl: 'https://example.com/city-populations-source',
        },
    });

    const healthDataset = await prisma.dataset.create({
        data: {
            slug: 'public-health-metrics-demo',
            title: 'Public Health Metrics (Demo)',
            description:
                'Sample health indicators across regions—good for experimenting with filters and charts.',
            sourceUrl: 'https://example.com/health-metrics-source',
        },
    });

    // Sample city records
    await prisma.record.createMany({
        data: [
            {
                datasetId: cityDataset.id,
                data: {
                    city: 'Metropolis',
                    country: 'Fictionland',
                    population: 1200000,
                    region: 'North',
                    year: 2024,
                },
            },
            {
                datasetId: cityDataset.id,
                data: {
                    city: 'Riverbend',
                    country: 'Fictionland',
                    population: 340000,
                    region: 'East',
                    year: 2024,
                },
            },
            {
                datasetId: cityDataset.id,
                data: {
                    city: 'Dustvale',
                    country: 'Fictionland',
                    population: 87000,
                    region: 'South',
                    year: 2024,
                },
            },
        ],
    });

    // Sample health metric records
    await prisma.record.createMany({
        data: [
            {
                datasetId: healthDataset.id,
                data: {
                    region: 'North',
                    year: 2023,
                    metric: 'life_expectancy',
                    value: 79.4,
                    unit: 'years',
                },
            },
            {
                datasetId: healthDataset.id,
                data: {
                    region: 'East',
                    year: 2023,
                    metric: 'infant_mortality',
                    value: 3.5,
                    unit: 'per_1000',
                },
            },
            {
                datasetId: healthDataset.id,
                data: {
                    region: 'South',
                    year: 2023,
                    metric: 'smoking_rate',
                    value: 18.2,
                    unit: 'percent',
                },
            },
        ],
    });

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
