// src/components/JellyStat.tsx
export function JellyStat(props: { label: string; value: string; hint?: string }) {
    const { label, value, hint } = props;

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="text-[11px] font-medium text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 text-2xl font-semibold text-foreground">
                {value}
            </div>
            {hint && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                    {hint}
                </div>
            )}
        </div>
    );
}
