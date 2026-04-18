import React from 'react';
import { BookOpen, Download, Upload } from 'lucide-react';

function CatalogIllustration() {
    return (
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-[#f3f4f6]" />

            {/* Document Card */}
            <div className="relative z-10 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] w-[110px] h-[130px] flex flex-col items-start justify-center px-3 py-3 gap-3 border border-[#e8e8e8]">

                {/* Row 1 — Active (green icon) */}
                <div className="flex items-center gap-2 w-full">
                    <div className="w-5 h-5 rounded-full bg-[#d1fae5] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[#059669]" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="8" r="6" />
                        </svg>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 bg-[#e5e7eb] rounded-full w-full" />
                    </div>
                    <div className="w-4 h-4 rounded bg-[#d1fae5] flex-shrink-0">
                        <svg className="w-4 h-4 text-[#059669]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 8h8M10 6l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Row 2 — Muted */}
                <div className="flex items-center gap-2 w-full opacity-40">
                    <div className="w-5 h-5 rounded-full bg-[#e5e7eb] flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-[#e5e7eb] rounded-full" />
                    <div className="w-4 h-4 rounded bg-[#e5e7eb] flex-shrink-0" />
                </div>

                {/* Row 3 — Muted */}
                <div className="flex items-center gap-2 w-full opacity-20">
                    <div className="w-5 h-5 rounded-full bg-[#e5e7eb] flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-[#e5e7eb] rounded-full" />
                    <div className="w-4 h-4 rounded bg-[#e5e7eb] flex-shrink-0" />
                </div>
            </div>
        </div>
    );
}

export default function Catalogs() {
    return (
        <div className="min-h-full font-sans pb-10">
            <div className="w-full px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1.5} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Catalogs</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            Export
                        </button>
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            Import
                        </button>
                        <button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                            Create catalog
                        </button>
                    </div>
                </div>

                {/* Empty State Card */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-16 px-8 mb-4 min-h-[360px]">
                    <CatalogIllustration />

                    <div className="mt-8 text-center max-w-[360px]">
                        <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-2">Personalize buying with catalogs</h2>
                        <p className="text-[13px] text-[#5c5f62] leading-relaxed mb-6">
                            Create custom product and pricing offerings for your customers with catalogs.
                        </p>
                        <button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
                            Create catalog
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[13px] text-[#5c5f62]">
                    Learn more about <a href="#" className="underline hover:text-[#1a1a1a]">catalogs</a>
                </div>

            </div>
        </div>
    );
}