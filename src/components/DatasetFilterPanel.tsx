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
    sortableKeys: string[];
};

export function DatasetFilterPanel({
    slug,
    years,
    states,
    sortableKeys,
}: DatasetFilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [year, setYear] = React.useState<string>(
        searchParams.get('year') ?? '',
    );
    const [state, setState] = React.useState<string>(
        searchParams.get('state') ?? '',
    );
    const [sortKey, setSortKey] = React.useState<string>(
        searchParams.get('sortKey') ?? '',
    );
    const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>(
        (searchParams.get('sortDir') as 'asc' | 'desc') || 'asc',
    );

    function applyFilters() {
        const params = new URLSearchParams(searchParams.toString());

        if (year) params.set('year', year);
        else params.delete('year');

        if (state) params.set('state', state);
        else params.delete('state');

        if (sortKey) params.set('sortKey', sortKey);
        else params.delete('sortKey');

        params.set('sortDir', sortDir);

        router.push(`/datasets/${slug}?${params.toString()}`);
    }

    function clearFilters() {
        const params = new URLSearchParams();
        router.push(`/datasets/${slug}?${params.toString()}`);
    }

    return (
        <JellyCard
            title="Filters & Sorting"
            description="Refine the records shown below."
            className="bg-slate-900/80 border-slate-800"
        >
            <div className="flex flex-wrap items-end gap-4">
                {/* Year select */}
                {years.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-300">Year</span>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-8 w-[120px] border-slate-700 bg-slate-950 text-xs">
                                <SelectValue placeholder="All years" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-xs">
                                <SelectItem value="__all__">All years</SelectItem>
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
                        <span className="text-slate-300">State</span>
                        <Select value={state} onValueChange={setState}>
                            <SelectTrigger className="h-8 w-[160px] border-slate-700 bg-slate-950 text-xs">
                                <SelectValue placeholder="All states" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 bg-slate-900 text-xs">
                                <SelectItem value="__all__">All states</SelectItem>
                                {states.map((st) => (
                                    <SelectItem key={st} value={st}>
                                        {st}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Sort key */}
                {sortableKeys.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-300">Sort by</span>
                        <Select value={sortKey} onValueChange={setSortKey}>
                            <SelectTrigger className="h-8 w-[160px] border-slate-700 bg-slate-950 text-xs">
                                <SelectValue placeholder="(no sorting)" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-xs">
                                <SelectItem value="__all__">(no sorting)</SelectItem>
                                {sortableKeys.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Sort direction */}
                <div className="flex flex-col gap-1 text-xs">
                    <span className="text-slate-300">Direction</span>
                    <Select
                        value={sortDir}
                        onValueChange={(val: 'asc' | 'desc') => setSortDir(val)}
                    >
                        <SelectTrigger className="h-8 w-[120px] border-slate-700 bg-slate-950 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-xs">
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                        onClick={applyFilters}
                    >
                        Apply
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
                        onClick={clearFilters}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </JellyCard>
    );
}
