// scripts/import/import_salary_2024.cjs
/**
 * Imports "Dataset salary 2024.csv" into the JellyDataLab database.
 *
 * CSV header:
 * work_year,experience_level,employment_type,job_title,salary,
 * salary_currency,salary_in_usd,employee_residence,remote_ratio,
 * company_location,company_size
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ADJUST IF YOUR PATH IS DIFFERENT
const CSV_PATH = path.resolve(
    'data',
    'raw',
    'Dataset salary 2024.csv'
);

const DATASET_SLUG = 'salary-2024';
const DATASET_TITLE = 'ML / Data Salary Dataset 2024';
const DATASET_DESCRIPTION =
    'Job salaries for data & ML roles in 2024, including work year, experience, location, remote ratio, and compensation.';
const DATASET_SOURCE_URL = null; // set a URL if you have one

async function main() {
    console.log('🌱 Starting import for Salary Dataset 2024...');
    console.log('📄 CSV:', CSV_PATH);

    let dataset = await prisma.dataset.findUnique({
        where: { slug: DATASET_SLUG },
    });

    if (!dataset) {
        dataset = await prisma.dataset.create({
            data: {
                slug: DATASET_SLUG,
                title: DATASET_TITLE,
                description: DATASET_DESCRIPTION,
                sourceUrl: DATASET_SOURCE_URL,
            },
        });
        console.log('📁 Created dataset:', dataset.slug);
    } else {
        console.log('📁 Dataset already exists:', dataset.slug);
    }

    const datasetId = dataset.id;

    console.log('🧹 Clearing existing records for this dataset...');
    await prisma.record.deleteMany({
        where: { datasetId },
    });

    const rows = [];

    console.log('📥 Reading CSV...');

    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv()) // uses header row automatically
            .on('data', (row) => {
                if (rows.length < 3) {
                    console.log('ROW SAMPLE (raw):', row);
                }

                // Normalize numeric fields
                const normalized = {
                    work_year: Number(row.work_year),
                    experience_level: row.experience_level,
                    employment_type: row.employment_type,
                    job_title: row.job_title,
                    salary: Number(row.salary),
                    salary_currency: row.salary_currency,
                    salary_in_usd: Number(row.salary_in_usd),
                    employee_residence: row.employee_residence,
                    remote_ratio: Number(row.remote_ratio),
                    company_location: row.company_location,
                    company_size: row.company_size,
                };

                rows.push({
                    datasetId,
                    data: normalized,
                });
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`📊 Loaded ${rows.length} rows from CSV.`);

    if (rows.length === 0) {
        console.error('❌ No rows found in CSV. Check the file and path.');
        return;
    }

    const BATCH_SIZE = 500;
    console.log('📝 Inserting into DB in batches of', BATCH_SIZE);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);

        await prisma.record.createMany({
            data: batch,
        });

        console.log(`   → Inserted batch ${i / BATCH_SIZE + 1}`);
    }

    console.log('✅ Salary 2024 import complete!');
}

main()
    .catch((err) => {
        console.error('❌ Import failed:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
