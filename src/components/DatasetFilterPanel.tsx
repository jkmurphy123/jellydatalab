// src/components/DatasetFilterPanel.tsx
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

type DatasetFilterPanelProps = {
    slug: string;
    years: number[];
    states: string[];
};

const ALL_VALUE = '__all__';

export function DatasetFilterPanel({
    slug,
    years,
    states,
}: DatasetFilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialYear = searchParams.get('year') ?? ALL_VALUE;
    const initialState = searchParams.get('state') ?? ALL_VALUE;

    const [year, setYear] = React.useState<string>(
        initialYear === '' ? ALL_VALUE : initialYear,
    );
    const [state, setState] = React.useState<string>(
        initialState === '' ? ALL_VALUE : initialState,
    );

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString());

        if (year && year !== ALL_VALUE) {
            params.set('year', year);
        } else {
            params.delete('year');
        }

        if (state && state !== ALL_VALUE) {
            params.set('state', state);
        } else {
            params.delete('state');
        }

        router.push(`/datasets/${slug}?${params.toString()}`);
    }

    function clearFilters() {
        router.push(`/datasets/${slug}`);
    }

    return (
        <JellyCard
            title="Filters"
            description="Refine the records shown below."
            // keep this using theme
            className="bg-card border-border"
        >
            <div className="flex flex-wrap items-end gap-4">
                {/* Year select */}
                {years.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        {/* ⬇️ MUCH darker label */}
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                            Year
                        </span>
                        <Select value={year} onValueChange={setYear}>
                            {/* ⬇️ Stronger contrast on trigger */}
                            <SelectTrigger className="h-8 w-[120px] rounded-md border border-slate-400 bg-slate-100 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-xs text-slate-900 dark:bg-slate-900 dark:text-slate-100">
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

                {/* State select */}
                {states.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                            State
                        </span>
                        <Select value={state} onValueChange={setState}>
                            <SelectTrigger className="h-8 w-[160px] rounded-md border border-slate-400 bg-slate-100 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="All states" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 bg-white text-xs text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                                <SelectItem value={ALL_VALUE}>All states</SelectItem>
                                {states.map((st) => (
                                    <SelectItem key={st} value={st}>
                                        {st}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                    {/* Apply: keep using primary, which already looks good */}
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full border border-slate-500 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
                        onClick={applyFilters}
                    >
                        Apply
                    </Button>

                    {/* Clear: make outline and text dark */}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border border-slate-500 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
                        onClick={clearFilters}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </JellyCard>
    );
}
