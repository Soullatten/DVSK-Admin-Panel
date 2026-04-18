import React, { useState } from 'react';
import { Globe, Search, SlidersHorizontal, ArrowLeftRight, X, Plus, Sparkles } from 'lucide-react';

const suggestions = [
    { id: 1, label: 'Create United States Market', flag: '🇺🇸' },
    { id: 2, label: 'Create United Kingdom Market', flag: '🇬🇧' },
];

export default function Markets() {
    const [dismissed, setDismissed] = useState<number[]>([]);
    const [search, setSearch] = useState('');

    return (
        <div className="min-h-full font-sans pb-10">
            <div className="w-full px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1.5} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Markets</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm transition-colors">
                            {/* Graph View icon */}
                            <svg className="w-4 h-4 text-[#5c5f62]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <circle cx="5" cy="10" r="2.5" />
                                <circle cx="15" cy="5" r="2.5" />
                                <circle cx="15" cy="15" r="2.5" />
                                <line x1="7.5" y1="9" x2="12.5" y2="6.2" />
                                <line x1="7.5" y1="11" x2="12.5" y2="13.8" />
                            </svg>
                            Graph view
                        </button>
                        <button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                            Create market
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">

                    {/* Search + Controls Row */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                        <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] transition-colors text-[#5c5f62]">
                            <ArrowLeftRight className="w-4 h-4" />
                        </button>
                        <div className="flex-1 flex items-center gap-2 bg-[#fafafa] border border-[#e8e8e8] rounded-lg px-3 py-1.5">
                            <Search className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search in all markets"
                                className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none"
                            />
                        </div>
                        <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] transition-colors text-[#5c5f62]">
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] transition-colors text-[#5c5f62]">
                            <ArrowLeftRight className="w-4 h-4 rotate-90" />
                        </button>
                    </div>

                    {/* Table Header */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#f0f0f0] bg-white">
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[280px]">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#1a1a1a] select-none">
                                        Market
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 3l3 4H5l3-4zm0 10L5 9h6l-3 4z" />
                                        </svg>
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[200px]">Status</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[300px]">Includes</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62]">Customizations</th>
                            </tr>
                        </thead>
                        <tbody>

                            {/* India Row */}
                            <tr className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors cursor-pointer group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-[#5c5f62] flex-shrink-0" strokeWidth={1.5} />
                                        <span className="text-[14px] font-semibold text-[#1a1a1a]">India</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#d4f7e0] text-[#1a6641]">
                                        Active
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-[13px] text-[#1a1a1a]">
                                        <span className="text-base leading-none">🇮🇳</span>
                                        <span>India</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[13px] text-[#9ca3af]">—</td>
                            </tr>

                            {/* Suggestion Rows */}
                            {suggestions
                                .filter((s) => !dismissed.includes(s.id))
                                .map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-[#f0f0f0] bg-[#faf8ff] hover:bg-[#f3f0ff] transition-colors"
                                    >
                                        <td className="px-4 py-3" colSpan={3}>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
                                                <span className="text-[13px] font-semibold text-[#6d28d9]">{s.label}</span>
                                                <button className="ml-1 w-5 h-5 rounded-full border border-[#c4b5fd] flex items-center justify-center hover:bg-[#ede9fe] transition-colors">
                                                    <Plus className="w-3 h-3 text-[#7c3aed]" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setDismissed((d) => [...d, s.id])}
                                                className="p-1.5 hover:bg-[#ede9fe] rounded-md transition-colors text-[#9ca3af] hover:text-[#7c3aed]"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="py-4 text-center text-[13px] text-[#5c5f62]">
                        <a href="#" className="hover:underline hover:text-[#1a1a1a] transition-colors">
                            Learn more about markets
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}