// src/app/datasets/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDatasetBySlug, getRecordsForDataset } from '@/lib/datasets';

type RouteParams = {
    slug: string;
};

type Props = {
    params: Promise<RouteParams>;
};

export default async function DatasetDetailPage({ params }: Props) {
    // ⬅️ This is the important line: unwrap the params Promise
    const { slug } = await params;

    const dataset = await getDatasetBySlug(slug);

    if (!dataset) {
        notFound();
    }

    const records = await getRecordsForDataset(dataset.id, 10);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs text-slate-400">
                    <Link href="/datasets" className="hover:text-emerald-300">
                        ← Back to datasets
                    </Link>
                </p>
                <h1 className="text-2xl font-bold text-slate-50">{dataset.title}</h1>
                <p className="text-sm text-slate-300">{dataset.description}</p>
                {dataset.sourceUrl && (
                    <p className="text-xs text-slate-400">
                        Source:{' '}
                        <a
                            href={dataset.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300"
                        >
                            {dataset.sourceUrl}
                        </a>
                    </p>
                )}
            </div>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-200">
                    Sample records (first 10)
                </h2>

                {records.length === 0 ? (
                    <p className="text-sm text-slate-400">No records found yet.</p>
                ) : (
                    <div className="overflow-hidden rounded-xl bg-slate-900/60 ring-1 ring-slate-800">
                        <table className="min-w-full border-collapse text-left text-xs">
                            <thead className="bg-slate-900/80 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2">ID</th>
                                    <th className="px-3 py-2">Data (JSON)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec) => (
                                    <tr
                                        key={rec.id}
                                        className="border-t border-slate-800 hover:bg-slate-900"
                                    >
                                        <td className="px-3 py-2 align-top text-slate-400">
                                            {rec.id}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-[11px] text-slate-200">
                                            <pre className="whitespace-pre-wrap break-words">
                                                {JSON.stringify(rec.data, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
