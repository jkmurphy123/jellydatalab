// src/app/datasets/page.tsx
import Link from 'next/link';
import { getAllDatasets } from '@/lib/datasets';

export default async function DatasetsPage() {
    const datasets = await getAllDatasets();

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold text-muted-foreground">Datasets</h1>
                <p className="text-sm text-foreground">
                    Browse the demo datasets available in JellyDataLab. This page is now
                    backed by a real database using Prisma + SQLite.
                </p>
            </header>

            {datasets.length === 0 ? (
                <div className="rounded-xl bg-background/60 p-4 ring-1 ring-slate-800">
                    <p className="text-sm text-foreground">
                        No datasets found. Try running <code>npx prisma db seed</code> to
                        load demo data.
                    </p>
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {datasets.map((ds) => (
                        <li
                            key={ds.id}
                            className="rounded-xl bg-background/60 p-4 ring-1 ring-slate-800"
                        >
                            <h2 className="text-base font-semibold text-muted-foreground">
                                <Link
                                    href={`/datasets/${ds.slug}`}
                                    className="hover:text-emerald-300"
                                >
                                    {ds.title}
                                </Link>
                            </h2>
                            <p className="mt-2 line-clamp-3 text-sm text-foreground">
                                {ds.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs text-foreground">
                                {ds.sourceUrl && (
                                    <a
                                        href={ds.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-emerald-300"
                                    >
                                        View source ↗
                                    </a>
                                )}
                                <Link
                                    href={`/datasets/${ds.slug}`}
                                    className="ml-auto text-emerald-400 hover:text-emerald-300"
                                >
                                    Open dataset →
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
