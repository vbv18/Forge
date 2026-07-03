"use client";

import { Monitor, Smartphone } from "lucide-react";
import { SectionLabel } from "./re-usables";

export function MobileBlocker() {
    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
            <div className="relative mb-8 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                    <Monitor className="h-12 w-12 text-blue-200" />
                </div>
                <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] shadow-lg">
                    <Smartphone className="h-5 w-5 text-white/40" />
                </div>
            </div>

            <h1 className="mb-3 font-serif text-3xl font-semibold tracking-tight text-white">
                Desktop Required
            </h1>

            <p className="mb-2 max-w-sm text-base leading-relaxed text-white/80">
                The workspace is designed for larger screens and requires a desktop or
                laptop to work properly.
            </p>
            <p className="max-w-xs text-sm text-white/50">
                Please open this page on a desktop browser for the best experience.
            </p>

            <div className="mt-10 flex items-center gap-3">
                <SectionLabel>Switch to desktop</SectionLabel>
            </div>
        </div>
    );
}