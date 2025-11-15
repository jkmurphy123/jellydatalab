// src/components/JellyCard.tsx
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type JellyCardProps = {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
};

export function JellyCard({ title, description, children, className }: JellyCardProps) {
    return (
        <Card className={className ?? 'bg-card border-border shadow-lg'}>
            {(title || description) && (
                <CardHeader className="pb-3">
                    {title && (
                        <CardTitle className="text-sm font-semibold text-muted-foreground">
                            {title}
                        </CardTitle>
                    )}
                    {description && (
                        <CardDescription className="text-xs text-foreground">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            <CardContent className="pt-0 text-xs text-slate-100">
                {children}
            </CardContent>
        </Card>
    );
}
