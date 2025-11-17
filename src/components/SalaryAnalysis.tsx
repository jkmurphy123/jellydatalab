// src/components/SalaryAnalysis.tsx
import { JellyStat } from './JellyStat';
import { JellyCard } from './JellyCard';

type SalaryRow = {
    work_year?: number;
    experience_level?: string;
    employment_type?: string;
    job_title?: string;
    salary?: number;
    salary_currency?: string;
    salary_in_usd?: number;
    employee_residence?: string;
    remote_ratio?: number;
    company_location?: string;
    company_size?: string;
};

type SalaryAnalysisProps = {
    rows: ({ id: number } & SalaryRow)[];
};

export function SalaryAnalysis({ rows }: SalaryAnalysisProps) {
    const count = rows.length;

    // Avg salary in USD
    let sumUsd = 0;
    let numUsd = 0;

    const titleCounts = new Map<string, number>();
    const expCounts = new Map<string, number>();
    const remoteCounts = new Map<string, number>();
    const countryStats = new Map<
        string,
        { sum: number; count: number }
    >();

    for (const row of rows) {
        const salaryUsd = row.salary_in_usd;
        if (typeof salaryUsd === 'number' && !Number.isNaN(salaryUsd)) {
            sumUsd += salaryUsd;
            numUsd++;
        }

        const title = row.job_title ?? '';
        if (title) {
            titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
        }

        const exp = row.experience_level ?? '';
        if (exp) {
            expCounts.set(exp, (expCounts.get(exp) ?? 0) + 1);
        }

        const rr = row.remote_ratio;
        let remoteKey = '';
        if (typeof rr === 'number') {
            if (rr === 0) remoteKey = 'On-site';
            else if (rr === 50) remoteKey = 'Hybrid';
            else if (rr === 100) remoteKey = 'Fully Remote';
            else remoteKey = `${rr}% remote`;
        }
        if (remoteKey) {
            remoteCounts.set(remoteKey, (remoteCounts.get(remoteKey) ?? 0) + 1);
        }

        const country = row.company_location ?? '';
        if (country && typeof salaryUsd === 'number' && !Number.isNaN(salaryUsd)) {
            const current = countryStats.get(country) ?? { sum: 0, count: 0 };
            current.sum += salaryUsd;
            current.count += 1;
            countryStats.set(country, current);
        }
    }

    const avgUsd =
        numUsd > 0 ? Math.round((sumUsd / numUsd) * 100) / 100 : null;

    const topTitles = Array.from(titleCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const expBreakdown = Array.from(expCounts.entries()).sort(
        (a, b) => b[1] - a[1],
    );

    const remoteBreakdown = Array.from(remoteCounts.entries()).sort(
        (a, b) => b[1] - a[1],
    );

    const topCountries = Array.from(countryStats.entries())
        .map(([country, { sum, count }]) => ({
            country,
            avg: sum / count,
            count,
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);

    function formatMoney(n: number | null) {
        if (n == null) return '—';
        return `$${n.toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })}`;
    }

    return (
        <div className="space-y-4">
            {/* Top stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <JellyStat
                    label="Records in view"
                    value={count.toLocaleString('en-US')}
                    hint="After filters"
                />
                <JellyStat
                    label="Average Salary (USD)"
                    value={formatMoney(avgUsd)}
                    hint="Based on salary_in_usd"
                />
                {topTitles[0] && (
                    <JellyStat
                        label="Most common job title"
                        value={topTitles[0][0]}
                        hint={`${topTitles[0][1].toLocaleString('en-US')} records`}
                    />
                )}
            </div>

            {/* Breakdown cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Experience breakdown */}
                <JellyCard
                    title="Experience Level"
                    description="Counts by experience code"
                    className="bg-card border-border"
                >
                    <ul className="space-y-1 text-xs text-foreground">
                        {expBreakdown.length === 0 && (
                            <li className="text-muted-foreground">No data</li>
                        )}
                        {expBreakdown.map(([level, cnt]) => (
                            <li key={level} className="flex justify-between">
                                <span>{level || 'Unknown'}</span>
                                <span className="text-muted-foreground">
                                    {cnt.toLocaleString('en-US')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </JellyCard>

                {/* Remote breakdown */}
                <JellyCard
                    title="Remote Work"
                    description="On-site / Hybrid / Fully Remote"
                    className="bg-card border-border"
                >
                    <ul className="space-y-1 text-xs text-foreground">
                        {remoteBreakdown.length === 0 && (
                            <li className="text-muted-foreground">No data</li>
                        )}
                        {remoteBreakdown.map(([label, cnt]) => (
                            <li key={label} className="flex justify-between">
                                <span>{label}</span>
                                <span className="text-muted-foreground">
                                    {cnt.toLocaleString('en-US')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </JellyCard>

                {/* Top countries by avg salary */}
                <JellyCard
                    title="Top Countries by Avg Salary (USD)"
                    description="Based on company location"
                    className="bg-card border-border"
                >
                    <ul className="space-y-1 text-xs text-foreground">
                        {topCountries.length === 0 && (
                            <li className="text-muted-foreground">No data</li>
                        )}
                        {topCountries.map((c) => (
                            <li key={c.country} className="flex justify-between">
                                <span>{c.country}</span>
                                <span className="text-muted-foreground">
                                    {formatMoney(c.avg)} ({c.count.toLocaleString('en-US')})
                                </span>
                            </li>
                        ))}
                    </ul>
                </JellyCard>
            </div>
        </div>
    );
}
