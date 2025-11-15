// scripts/import/import_state_populations.cjs
/**
 * Imports a historical state population CSV into the JellyDataLab database.
 * CSV should contain at least: state, year, population (column names may vary).
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ----- CONFIG -----
const CSV_PATH = path.resolve(
    'C:/Users/jkmur/GitProjects/jellydatalab/data/processed/state_populations.csv'
);

// You can customize these if your CSV column names differ
const COLUMN_MAPPING = {
    state: 'state',
    year: 'year',
    population: 'population',
};

async function main() {
    console.log('🌱 Starting import of state populations...');
    console.log('📄 CSV:', CSV_PATH);

    // 1. Ensure dataset exists or create it
    const datasetSlug = 'state-pop-by-year';
    let dataset = await prisma.dataset.findUnique({
        where: { slug: datasetSlug },
    });

    if (!dataset) {
        dataset = await prisma.dataset.create({
            data: {
                slug: datasetSlug,
                title: 'State Populations by Year (Historical)',
                description:
                    'Historical U.S. state populations loaded from CSV for demonstration.',
                sourceUrl: 'https://example.com/state-population-source',
            },
        });
        console.log('📁 Created dataset:', dataset.slug);
    } else {
        console.log('📁 Dataset already exists:', dataset.slug);
    }

    const datasetId = dataset.id;

    // OPTIONAL: Clear old records for this dataset
    console.log('🧹 Clearing any existing records for dataset...');
    await prisma.record.deleteMany({
        where: { datasetId: datasetId },
    });

    // 2. Read CSV and batch insert records
    const rows = [];

    console.log('📥 Reading CSV...');

    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(
                csv({
                    headers: ['state', 'year', 'population'], // <— assign column names
                    skipLines: 0,  // No header row to skip
                })
            )
            .on('data', (row) => {
                // TEMP: inspect the first few rows
                if (rows.length < 5) {
                    console.log('ROW SAMPLE:', row);
                }

                // Convert each row to JSON for Prisma
                const record = {
                    datasetId,
                    data: {
                        state: row[COLUMN_MAPPING.state],
                        year: parseInt(row[COLUMN_MAPPING.year], 10),
                        population: parseInt(row[COLUMN_MAPPING.population], 10),
                    },
                };
                rows.push(record);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`📊 Loaded ${rows.length} rows from CSV.`);

    if (rows.length === 0) {
        console.error('❌ No rows found in CSV. Check headers!');
        return;
    }

    // 3. Insert rows in batches to avoid overloading SQLite
    const BATCH_SIZE = 250;
    console.log('📝 Inserting into DB in batches of', BATCH_SIZE);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        await prisma.record.createMany({
            data: batch,
        });

        console.log(`   → Inserted batch ${i / BATCH_SIZE + 1}`);
    }

    console.log('✅ Import complete!');
}

main()
    .catch((err) => {
        console.error('❌ Import failed:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
