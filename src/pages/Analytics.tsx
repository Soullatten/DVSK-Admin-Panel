import React, { useState } from 'react';
import { BarChart2, Calendar, ChevronDown, RefreshCw, MoreHorizontal } from 'lucide-react';

const statCards = [
    { label: 'Gross sales', value: '₹0.00', change: '—', hasChart: true },
    { label: 'Returning customer rate', value: '0%', change: '—', hasChart: true },
    { label: 'Orders fulfilled', value: '0', change: '—', hasChart: true },
    { label: 'Orders', value: '0', change: '—', hasChart: true },
];

const salesBreakdown = [
    { label: 'Gross sales', value: '₹0.00' },
    { label: 'Discounts', value: '₹0.00' },
    { label: 'Returns', value: '₹0.00' },
    { label: 'Net sales', value: '₹0.00' },
    { label: 'Shipping charges', value: '₹0.00' },
    { label: 'Return fees', value: '₹0.00' },
    { label: 'Taxes', value: '₹0.00' },
    { label: 'Total sales', value: '₹0.00' },
];

function MiniSparkline() {
    return (
        <svg viewBox="0 0 80 20" className="w-20 h-5">
            <line x1="0" y1="14" x2="80" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function EmptyChart({ label, value }: { label: string; value?: string }) {
    return (
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col">
            <div className="text-[13px] font-semibold text-[#1a1a1a] mb-1 border-b border-dashed border-[#d1d5db] pb-1 w-fit">{label}</div>
            {value && <div className="text-[22px] font-bold text-[#1a1a1a] mt-2 mb-1">{value} <span className="text-[14px] font-normal text-[#9ca3af]">—</span></div>}
            <div className="flex-1 flex items-center justify-center text-[13px] text-[#9ca3af] min-h-[120px]">
                No data for this date range
            </div>
        </div>
    );
}

function TotalSalesChart() {
    const times = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    const H = 180;
    const W = 600;

    return (
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 col-span-2">
            <div className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] pb-1 w-fit mb-2">Total sales over time</div>
            <div className="text-[22px] font-bold text-[#1a1a1a] mb-4">₹0.00 <span className="text-[14px] font-normal text-[#9ca3af]">—</span></div>

            <div className="relative" style={{ height: `${H}px` }}>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                    {/* Y axis labels */}
                    {['₹10', '₹5', '₹0'].map((label, i) => (
                        <text key={i} x="0" y={i === 0 ? 12 : i === 1 ? H / 2 : H - 4} fontSize="10" fill="#9ca3af">{label}</text>
                    ))}

                    {/* Grid lines */}
                    {[0, 0.5, 1].map((t, i) => (
                        <line key={i} x1="30" y1={t * H} x2={W} y2={t * H} stroke="#f0f0f0" strokeWidth="1" />
                    ))}

                    {/* Solid line — today */}
                    <line x1="30" y1={H - 2} x2={W} y2={H - 2} stroke="#3b82f6" strokeWidth="1.5" />

                    {/* Dashed line — yesterday */}
                    <line x1="30" y1={H - 2} x2={W} y2={H - 2} stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />

                    {/* Dot at origin */}
                    <circle cx="30" cy={H - 2} r="3.5" fill="#3b82f6" />
                </svg>

                {/* X axis labels */}
                <div className="flex justify-between text-[11px] text-[#9ca3af] mt-1 pl-7 pr-2">
                    {times.map((t) => <span key={t}>{t}</span>)}
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[12px] text-[#5c5f62]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Apr 17, 2026
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#5c5f62]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" /> Apr 16, 2026
                </div>
            </div>
        </div>
    );
}

function TotalSalesBreakdown() {
    return (
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 row-span-2">
            <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] pb-1 w-fit">Total sales breakdown</div>
                <button className="text-[#9ca3af] hover:text-[#5c5f62]">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" /></svg>
                </button>
            </div>

            <div className="space-y-3">
                {salesBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[13px] text-[#2563eb] hover:underline cursor-pointer">{item.label}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-[#1a1a1a]">{item.value}</span>
                            <span className="text-[13px] text-[#9ca3af]">—</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Analytics() {
    return (
        <div className="min-h-full font-sans pb-10">
            <div className="w-full px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1.5} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Analytics</h1>
                        <span className="text-[12px] text-[#9ca3af] ml-2 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Last refreshed: 9:50 PM
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md transition-colors text-[#5c5f62]">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                            New exploration
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-5">
                    <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">
                        <Calendar className="w-3.5 h-3.5" /> Today <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">
                        <Calendar className="w-3.5 h-3.5" /> Apr 16, 2026 <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">
                        ⇄ INR ₹
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {statCards.map((card) => (
                        <div key={card.label} className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-4">
                            <div className="text-[12px] text-[#5c5f62] font-medium mb-2">{card.label}</div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-[20px] font-bold text-[#1a1a1a]">{card.value}</span>
                                    <span className="text-[13px] text-[#9ca3af] ml-1">{card.change}</span>
                                </div>
                                <MiniSparkline />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <TotalSalesChart />
                    <TotalSalesBreakdown />
                </div>

                {/* Bottom Charts Row */}
                <div className="grid grid-cols-3 gap-4">
                    <EmptyChart label="Total sales by sales channel" />
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col">
                        <div className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] pb-1 w-fit mb-2">Average order value over time</div>
                        <div className="text-[22px] font-bold text-[#1a1a1a] mb-3">₹0.00 <span className="text-[14px] font-normal text-[#9ca3af]">—</span></div>
                        <div className="relative flex-1 min-h-[120px]">
                            <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
                                {['₹10', '₹5', '₹0'].map((l, i) => (
                                    <text key={i} x="0" y={i === 0 ? 10 : i === 1 ? 40 : 70} fontSize="9" fill="#9ca3af">{l}</text>
                                ))}
                                {[0, 0.5, 1].map((t, i) => (
                                    <line key={i} x1="24" y1={t * 70 + 4} x2="400" y2={t * 70 + 4} stroke="#f0f0f0" strokeWidth="1" />
                                ))}
                                <line x1="24" y1="72" x2="400" y2="72" stroke="#3b82f6" strokeWidth="1.5" />
                                <line x1="24" y1="72" x2="400" y2="72" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />
                            </svg>
                            <div className="flex justify-between text-[10px] text-[#9ca3af] mt-1 pl-6">
                                {['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'].map(t => <span key={t}>{t}</span>)}
                            </div>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#5c5f62]"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Apr 17, 2026</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#5c5f62]"><div className="w-2 h-2 rounded-full bg-[#93c5fd]" /> Apr 16, 2026</div>
                        </div>
                    </div>
                    <EmptyChart label="Total sales by product" />
                </div>
            </div>
        </div>
    );
}