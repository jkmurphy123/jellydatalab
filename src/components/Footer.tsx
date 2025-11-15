// src/components/Footer.tsx

"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">

                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">

                    {/* Brand */}
                    <span className="font-semibold text-primary">
                        JellyDataLab
                    </span>

                    {/* Footer nav */}
                    <div className="flex items-center gap-4">
                        <Link href="/datasets" className="hover:text-primary">
                            Datasets
                        </Link>
                        <Link href="/about" className="hover:text-primary">
                            About
                        </Link>
                    </div>

                </div>

                {/* Copyright */}
                <div className="mt-2 text-center text-xs text-muted-foreground/80">
                    © {new Date().getFullYear()} JellyDataLab — Dive into the data.
                </div>

            </div>
        </footer>
    );
}
