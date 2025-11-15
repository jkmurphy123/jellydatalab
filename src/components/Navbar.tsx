// src/components/Navbar.tsx

"use client";

import Link from "next/link";

export function Navbar() {
    return (
        <header className="w-full border-b border-border bg-background/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Logo / Brand */}
                <Link href="/" className="text-lg font-bold text-primary hover:opacity-90">
                    JellyDataLab
                </Link>

                {/* Simple Nav Links */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/datasets" className="hover:text-primary">
                        Datasets
                    </Link>
                    <Link href="/about" className="hover:text-primary">
                        About
                    </Link>
                </div>

            </nav>
        </header>
    );
}
