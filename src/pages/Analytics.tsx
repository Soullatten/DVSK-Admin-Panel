import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, ChevronDown, RefreshCw, MoreHorizontal, Info, Check } from 'lucide-react';

// --- Currency Configuration ---
const CURRENCIES = [
    { code: 'INR', symbol: '₹', rate: 1, locale: 'en-IN', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', rate: 0.012, locale: 'en-US', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', rate: 0.011, locale: 'de-DE', label: 'Euro' },
    { code: 'GBP', symbol: '£', rate: 0.0095, locale: 'en-GB', label: 'British Pound' }
];

const DATE_PRESETS = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Apr 17, 2026', 'Apr 16, 2026', 'Apr 15, 2026'];

// --- Helper to format money dynamically ---
const formatMoney = (amount: number, currency: typeof CURRENCIES[0], compact = false) => {
    const converted = amount * currency.rate;
    if (compact) {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            maximumFractionDigits: 0,
            notation: "compact",
            compactDisplay: "short"
        }).format(converted);
    }
    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2
    }).format(converted);
};

export default function Analytics() {
    // --- State Management ---
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [date1, setDate1] = useState('Today');
    const [date2, setDate2] = useState('Apr 16, 2026');
    
    // Dropdown visibility states
    const [activeDropdown, setActiveDropdown] = useState<'date1' | 'date2' | 'currency' | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Simulate network request when filters change
    const handleFilterChange = () => {
        setActiveDropdown(null);
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 600);
    };

    // --- Mock Data (Raw numbers for conversion) ---
    const statCards = [
        { label: 'Gross sales', value: 14500.00, change: '+8%', isCurrency: true },
        { label: 'Returning customer rate', value: '24.5%', change: '-2.1%', isCurrency: false },
        { label: 'Orders fulfilled', value: '42', change: '+12%', isCurrency: false },
        { label: 'Orders', value: '45', change: '+10%', isCurrency: false },
    ];

    const salesBreakdown = [
        { label: 'Gross sales', value: 14500.00 },
        { label: 'Discounts', value: -1200.00 },
        { label: 'Returns', value: 0.00 },
        { label: 'Net sales', value: 13300.00 },
        { label: 'Shipping charges', value: 450.00 },
        { label: 'Return fees', value: 0.00 },
        { label: 'Taxes', value: 2394.00 },
        { label: 'Total sales', value: 16144.00, isTotal: true },
    ];

    // --- Sub-components (defined inside so they can access currency state) ---
    const MiniSparkline = ({ index }: { index: number }) => {
        const paths = [
            "M0 16 L10 14 L20 15 L30 8 L40 10 L50 4 L60 6 L70 2 L80 0",
            "M0 4 L10 6 L20 4 L30 12 L40 10 L50 16 L60 14 L70 18 L80 20",
            "M0 18 L15 14 L30 16 L45 8 L60 4 L80 2",
            "M0 16 L20 12 L40 14 L60 4 L80 0"
        ];
        const isDown = index === 1;
        return (
            <svg viewBox="0 0 80 20" className="w-20 h-5 overflow-visible">
                <path d={paths[index]} fill="none" stroke={isDown ? "#ef4444" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const TotalSalesChart = () => {
        const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
        const times = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
        const H = 180;
        const W = 600;
        
        const pointsToday = "M30 178 L110 170 L190 150 L270 110 L350 70 L430 40 L510 20 L590 10";
        const pointsYesterday = "M30 178 L110 175 L190 160 L270 130 L350 100 L430 80 L510 60 L590 50";
        
        // Raw numbers for accurate conversion on hover
        const rawHoverData = [
            {x: 30, y: 178, val: 0}, {x: 110, y: 170, val: 1200}, {x: 190, y: 150, val: 3400},
            {x: 270, y: 110, val: 6800}, {x: 350, y: 70, val: 10500}, {x: 430, y: 40, val: 13200},
            {x: 510, y: 20, val: 15100}, {x: 590, y: 10, val: 16144}
        ];

        return (
            <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 col-span-2 hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start">
                    <div>
                        <button className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] hover:border-[#1a1a1a] transition-colors pb-0.5 w-fit mb-2 flex items-center gap-1.5 focus:outline-none">
                            Total sales over time <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                        <div className="text-[22px] font-bold text-[#1a1a1a] mb-4">
                            {formatMoney(16144.00, currency)}
                            <span className="text-[14px] font-normal text-[#10b981] ml-2 inline-flex items-center">↑ 12%</span>
                        </div>
                    </div>
                    <button className="p-1.5 text-[#9ca3af] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-md transition-colors focus:outline-none">
                        <Info className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative" style={{ height: `${H}px` }}>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                        {/* Dynamic Y axis labels based on currency */}
                        {[20000, 10000, 0].map((val, i) => (
                            <text key={i} x="0" y={i === 0 ? 12 : i === 1 ? H / 2 : H - 4} fontSize="11" fill="#9ca3af" fontWeight="500">
                                {formatMoney(val, currency, true)}
                            </text>
                        ))}

                        {[0, 0.5, 1].map((t, i) => (
                            <line key={i} x1="45" y1={t * H} x2={W} y2={t * H} stroke="#f0f0f0" strokeWidth="1" />
                        ))}

                        <path d={pointsYesterday} fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={pointsToday} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                        {rawHoverData.map((pt, i) => (
                            <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                                <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
                                <circle cx={pt.x} cy={pt.y} r={hoveredPoint === i ? "4" : "0"} fill="#3b82f6" className="transition-all duration-200" />
                                {hoveredPoint === i && (
                                    <line x1={pt.x} y1={0} x2={pt.x} y2={H} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                                )}
                            </g>
                        ))}
                    </svg>

                    <div className="flex justify-between text-[11px] font-medium text-[#9ca3af] mt-2 pl-12 pr-1">
                        {times.map((t) => <span key={t}>{t}</span>)}
                    </div>

                    {hoveredPoint !== null && (
                        <div className="absolute bg-[#1a1a1a] text-white px-3 py-2 rounded-lg shadow-lg text-[12px] pointer-events-none transform -translate-x-1/2 -translate-y-[120%] z-10 whitespace-nowrap"
                            style={{ left: `${(rawHoverData[hoveredPoint].x / W) * 100}%`, top: `${(rawHoverData[hoveredPoint].y / H) * 100}%` }}>
                            <div className="font-semibold text-[#a1a1aa] mb-1">{times[hoveredPoint]}</div>
                            <div className="flex justify-between gap-4">
                                <span className="text-[#3b82f6]">{date1}</span> 
                                <span>{formatMoney(rawHoverData[hoveredPoint].val, currency, true)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-5 mt-4 pt-4 border-t border-[#f0f0f0]">
                    <button className="flex items-center gap-2 text-[12px] font-medium text-[#5c5f62] hover:text-[#1a1a1a] transition-colors focus:outline-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> {date1}
                    </button>
                    <button className="flex items-center gap-2 text-[12px] font-medium text-[#9ca3af] hover:text-[#5c5f62] transition-colors focus:outline-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" /> {date2}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f6f6f7] font-sans pb-10 selection:bg-blue-100 relative">
            
            {/* Click Outside Overlay */}
            {activeDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
            )}

            <div className="max-w-7xl mx-auto px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-md border border-[#e8e8e8] shadow-sm">
                            <BarChart2 className="w-5 h-5 text-[#1a1a1a]" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Analytics</h1>
                        <button onClick={handleFilterChange} className="text-[12px] text-[#5c5f62] hover:text-[#1a1a1a] ml-2 flex items-center gap-1.5 transition-colors focus:outline-none group">
                            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#3b82f6]' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
                            {isRefreshing ? 'Refreshing...' : 'Last refreshed: Just now'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-[#ebebeb] rounded-md transition-colors text-[#5c5f62] focus:outline-none active:scale-95">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button className="bg-[#1a1a1a] hover:bg-[#333] active:bg-[#000] active:scale-[0.98] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all focus:outline-none">
                            New exploration
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex items-center gap-2 mb-6">
                    {/* Date 1 Dropdown */}
                    <div className="relative z-50">
                        <button onClick={() => setActiveDropdown(activeDropdown === 'date1' ? null : 'date1')} className={`flex items-center gap-1.5 bg-white border ${activeDropdown === 'date1' ? 'border-[#1a1a1a] ring-1 ring-[#1a1a1a]' : 'border-[#d1d5db]'} text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9fafb] active:bg-[#f3f4f6] shadow-sm transition-all focus:outline-none`}>
                            <Calendar className="w-3.5 h-3.5 text-[#5c5f62]" /> {date1} <ChevronDown className="w-3.5 h-3.5 text-[#5c5f62]" />
                        </button>
                        {activeDropdown === 'date1' && (
                            <div className="absolute top-full mt-1.5 left-0 w-48 bg-white border border-[#e8e8e8] rounded-xl shadow-lg py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                {DATE_PRESETS.map(d => (
                                    <button key={d} onClick={() => { setDate1(d); handleFilterChange(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#f5f5f5] text-[#1a1a1a] flex items-center justify-between">
                                        {d} {date1 === d && <Check className="w-3.5 h-3.5 text-[#3b82f6]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date 2 Dropdown */}
                    <div className="relative z-50">
                        <button onClick={() => setActiveDropdown(activeDropdown === 'date2' ? null : 'date2')} className={`flex items-center gap-1.5 bg-white border ${activeDropdown === 'date2' ? 'border-[#1a1a1a] ring-1 ring-[#1a1a1a]' : 'border-[#d1d5db]'} text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9fafb] active:bg-[#f3f4f6] shadow-sm transition-all focus:outline-none`}>
                            <Calendar className="w-3.5 h-3.5 text-[#5c5f62]" /> {date2} <ChevronDown className="w-3.5 h-3.5 text-[#5c5f62]" />
                        </button>
                        {activeDropdown === 'date2' && (
                            <div className="absolute top-full mt-1.5 left-0 w-48 bg-white border border-[#e8e8e8] rounded-xl shadow-lg py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                {DATE_PRESETS.map(d => (
                                    <button key={d} onClick={() => { setDate2(d); handleFilterChange(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#f5f5f5] text-[#1a1a1a] flex items-center justify-between">
                                        {d} {date2 === d && <Check className="w-3.5 h-3.5 text-[#3b82f6]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Currency Dropdown */}
                    <div className="relative z-50">
                        <button onClick={() => setActiveDropdown(activeDropdown === 'currency' ? null : 'currency')} className={`flex items-center gap-1.5 bg-white border ${activeDropdown === 'currency' ? 'border-[#1a1a1a] ring-1 ring-[#1a1a1a]' : 'border-[#d1d5db]'} text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9fafb] active:bg-[#f3f4f6] shadow-sm transition-all focus:outline-none`}>
                            <span className="text-[#9ca3af] font-serif italic mr-0.5">{currency.symbol}</span> {currency.code} <ChevronDown className="w-3.5 h-3.5 text-[#5c5f62]" />
                        </button>
                        {activeDropdown === 'currency' && (
                            <div className="absolute top-full mt-1.5 left-0 w-40 bg-white border border-[#e8e8e8] rounded-xl shadow-lg py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                {CURRENCIES.map(c => (
                                    <button key={c.code} onClick={() => { setCurrency(c); handleFilterChange(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#f5f5f5] text-[#1a1a1a] flex items-center justify-between">
                                        <span className="flex items-center gap-2"><span className="text-[#9ca3af] font-serif italic w-4">{c.symbol}</span> {c.code}</span>
                                        {currency.code === c.code && <Check className="w-3.5 h-3.5 text-[#3b82f6]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className={`grid grid-cols-4 gap-4 mb-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                    {statCards.map((card, i) => (
                        <button key={card.label} className="text-left bg-white rounded-xl border border-[#e8e8e8] hover:border-[#c9cccf] hover:shadow-md active:scale-[0.99] shadow-sm p-4 transition-all focus:outline-none group">
                            <div className="text-[12px] text-[#5c5f62] font-medium mb-2 border-b border-dashed border-transparent group-hover:border-[#d1d5db] w-fit pb-0.5 transition-colors">
                                {card.label}
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-[20px] font-bold text-[#1a1a1a]">
                                        {card.isCurrency ? formatMoney(card.value as number, currency) : card.value}
                                    </span>
                                    <span className={`text-[13px] ml-1.5 font-medium ${card.change.includes('-') ? 'text-[#ef4444]' : card.change === '—' ? 'text-[#9ca3af]' : 'text-[#10b981]'}`}>
                                        {card.change !== '—' && (card.change.includes('-') ? '↓ ' : '↑ ')}{card.change}
                                    </span>
                                </div>
                                <MiniSparkline index={i} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Grid */}
                <div className={`grid grid-cols-3 gap-4 mb-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                    <TotalSalesChart />
                    
                    {/* Breakdown Component Inlined for state access */}
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 row-span-2 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <button className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] hover:border-[#1a1a1a] pb-0.5 transition-colors focus:outline-none">
                                Total sales breakdown
                            </button>
                            <button className="text-[#9ca3af] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] p-1.5 rounded-md transition-colors focus:outline-none">
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <div className="space-y-1 flex-1">
                            {salesBreakdown.map((item) => (
                                <div key={item.label} className={`flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors ${item.isTotal ? 'mt-4 pt-3 border-t border-[#e8e8e8] hover:bg-transparent' : 'hover:bg-[#f5f5f5] cursor-pointer group'}`}>
                                    <span className={`text-[13px] ${item.isTotal ? 'font-semibold text-[#1a1a1a]' : 'text-[#2563eb] group-hover:underline'}`}>
                                        {item.label}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[13px] ${item.isTotal ? 'font-bold text-[#1a1a1a]' : 'font-medium text-[#1a1a1a]'}`}>
                                            {formatMoney(item.value, currency)}
                                        </span>
                                        {!item.isTotal && <span className="text-[13px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">—</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 border border-[#e8e8e8] rounded-lg text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f9fafb] hover:border-[#d1d5db] active:bg-[#f3f4f6] transition-all focus:outline-none">
                            View report
                        </button>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className={`grid grid-cols-3 gap-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
                        <button className="text-[13px] font-semibold text-[#1a1a1a] mb-1 border-b border-dashed border-[#d1d5db] hover:border-[#1a1a1a] pb-0.5 w-fit flex items-center gap-1.5 transition-colors focus:outline-none">
                            Total sales by sales channel <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                        <div className="flex-1 flex items-center justify-center text-[13px] text-[#9ca3af] min-h-[120px] bg-[#fafafa] rounded-lg mt-3 border border-dashed border-[#e5e7eb]">
                            No data for this date range
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <button className="text-[13px] font-semibold text-[#1a1a1a] border-b border-dashed border-[#d1d5db] hover:border-[#1a1a1a] pb-0.5 transition-colors flex items-center gap-1.5 focus:outline-none">
                                Average order value over time <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                            </button>
                            <button className="text-[#9ca3af] hover:text-[#1a1a1a] transition-colors focus:outline-none"><MoreHorizontal className="w-4 h-4"/></button>
                        </div>
                        <div className="text-[22px] font-bold text-[#1a1a1a] mb-3">{formatMoney(384, currency)} <span className="text-[14px] font-normal text-[#10b981] ml-1">↑ 5%</span></div>
                        <div className="relative flex-1 min-h-[120px]">
                            <svg viewBox="0 0 400 80" className="w-full h-full overflow-visible">
                                {[500, 250, 0].map((l, i) => (
                                    <text key={i} x="0" y={i === 0 ? 10 : i === 1 ? 40 : 70} fontSize="10" fill="#9ca3af" fontWeight="500">{formatMoney(l, currency, true)}</text>
                                ))}
                                {[0, 0.5, 1].map((t, i) => (
                                    <line key={i} x1="38" y1={t * 70 + 4} x2="400" y2={t * 70 + 4} stroke="#f0f0f0" strokeWidth="1" />
                                ))}
                                <path d="M38 70 L100 65 L200 40 L300 45 L400 30" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M38 72 L100 70 L200 50 L300 60 L400 40" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
                        <button className="text-[13px] font-semibold text-[#1a1a1a] mb-1 border-b border-dashed border-[#d1d5db] hover:border-[#1a1a1a] pb-0.5 w-fit flex items-center gap-1.5 transition-colors focus:outline-none">
                            Total sales by product <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                        <div className="flex-1 flex items-center justify-center text-[13px] text-[#9ca3af] min-h-[120px] bg-[#fafafa] rounded-lg mt-3 border border-dashed border-[#e5e7eb]">
                            No data for this date range
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}