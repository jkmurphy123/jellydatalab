// src/components/SalaryFilterPanel.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JellyCard } from './JellyCard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

type SalaryFilterPanelProps = {
    slug: string;
    years: number[];
    experienceLevels: string[];
    companySizes: string[];
};

const ALL_VALUE = '__all__';

export function SalaryFilterPanel({
    slug,
    years,
    experienceLevels,
    companySizes,
}: SalaryFilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sp = (key: string, fallback = '') =>
        searchParams.get(key) ?? fallback;

    const [year, setYear] = React.useState<string>(
        sp('year') || ALL_VALUE,
    );
    const [exp, setExp] = React.useState<string>(
        sp('exp') || ALL_VALUE,
    );
    const [size, setSize] = React.useState<string>(
        sp('size') || ALL_VALUE,
    );
    const [title, setTitle] = React.useState<string>(sp('title') || '');
    const [minSalary, setMinSalary] = React.useState<string>(
        sp('minSalary') || '',
    );
    const [maxSalary, setMaxSalary] = React.useState<string>(
        sp('maxSalary') || '',
    );

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString());

        if (year && year !== ALL_VALUE) params.set('year', year);
        else params.delete('year');

        if (exp && exp !== ALL_VALUE) params.set('exp', exp);
        else params.delete('exp');

        if (size && size !== ALL_VALUE) params.set('size', size);
        else params.delete('size');

        const trimmedTitle = title.trim();
        if (trimmedTitle) params.set('title', trimmedTitle);
        else params.delete('title');

        if (minSalary.trim() !== '') params.set('minSalary', minSalary.trim());
        else params.delete('minSalary');

        if (maxSalary.trim() !== '') params.set('maxSalary', maxSalary.trim());
        else params.delete('maxSalary');

        router.push(`/datasets/${slug}?${params.toString()}`);
    }

    function clearFilters() {
        router.push(`/datasets/${slug}`);
    }

    return (
        <JellyCard
            title="Filters"
            description="Filter by year, experience, role, and salary range."
            className="bg-card border-border"
        >
            <div className="flex flex-wrap items-end gap-4">
                {/* Year */}
                {years.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[11px] font-medium text-foreground">
                            Year
                        </span>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-8 w-[120px] rounded-md border-input bg-background text-xs text-foreground">
                                <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-xs text-popover-foreground">
                                <SelectItem value={ALL_VALUE}>All years</SelectItem>
                                {years.map((yr) => (
                                    <SelectItem key={yr} value={yr.toString()}>
                                        {yr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Experience level */}
                {experienceLevels.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[11px] font-medium text-foreground">
                            Experience
                        </span>
                        <Select value={exp} onValueChange={setExp}>
                            <SelectTrigger className="h-8 w-[140px] rounded-md border-input bg-background text-xs text-foreground">
                                <SelectValue placeholder="All levels" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-xs text-popover-foreground">
                                <SelectItem value={ALL_VALUE}>All levels</SelectItem>
                                {experienceLevels.map((lvl) => (
                                    <SelectItem key={lvl} value={lvl}>
                                        {lvl}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Company size */}
                {companySizes.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[11px] font-medium text-foreground">
                            Company size
                        </span>
                        <Select value={size} onValueChange={setSize}>
                            <SelectTrigger className="h-8 w-[140px] rounded-md border-input bg-background text-xs text-foreground">
                                <SelectValue placeholder="All sizes" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-xs text-popover-foreground">
                                <SelectItem value={ALL_VALUE}>All sizes</SelectItem>
                                {companySizes.map((cs) => (
                                    <SelectItem key={cs} value={cs}>
                                        {cs}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Title search */}
                <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[11px] font-medium text-foreground">
                        Job title contains
                    </span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-8 w-[200px] rounded-md border-input bg-background px-2 text-xs text-foreground"
                        placeholder="e.g. Data Scientist"
                    />
                </div>

                {/* Salary range */}
                <div className="flex flex-col gap-1 text-xs">
                    <span className="text-[11px] font-medium text-foreground">
                        Salary (USD)
                    </span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={minSalary}
                            onChange={(e) => setMinSalary(e.target.value)}
                            className="h-8 w-[90px] rounded-md border-input bg-background px-2 text-xs text-foreground"
                            placeholder="Min"
                        />
                        <span className="text-[11px] text-muted-foreground">–</span>
                        <input
                            type="number"
                            value={maxSalary}
                            onChange={(e) => setMaxSalary(e.target.value)}
                            className="h-8 w-[90px] rounded-md border-input bg-background px-2 text-xs text-foreground"
                            placeholder="Max"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                        onClick={applyFilters}
                    >
                        Apply
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-border text-xs font-medium text-foreground hover:bg-muted/40"
                        onClick={clearFilters}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </JellyCard>
    );
}
