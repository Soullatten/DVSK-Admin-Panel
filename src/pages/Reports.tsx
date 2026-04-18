import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const allReports = [
    { name: 'Items ordered over time', category: 'Orders', lastViewed: 'Apr 17, 2026' },
    { name: 'Sessions by location', category: 'Acquisition', lastViewed: '' },
    { name: 'Sessions by referrer', category: 'Acquisition', lastViewed: '' },
    { name: 'Sessions by social referrer', category: 'Acquisition', lastViewed: '', link: true },
    { name: 'Sessions over time', category: 'Acquisition', lastViewed: '' },
    { name: 'Visitors over time', category: 'Acquisition', lastViewed: '', info: true, bell: true },
    { name: 'Visitors right now', category: 'Acquisition', lastViewed: '' },
    { name: 'Bounce rate over time', category: 'Behavior', lastViewed: '' },
    { name: 'Checkout conversion rate over time', category: 'Behavior', lastViewed: '' },
    { name: 'Conversion rate breakdown', category: 'Behavior', lastViewed: '' },
    { name: 'Conversion rate over time', category: 'Behavior', lastViewed: '' },
    { name: 'Customer behavior', category: 'Behavior', lastViewed: '' },
    { name: 'Product recommendation conversions over time', category: 'Behavior', lastViewed: '' },
    { name: 'Product recommendations with low engagement', category: 'Behavior', lastViewed: '' },
    { name: 'Search conversions over time', category: 'Behavior', lastViewed: '' },
    { name: 'Searches by search query', category: 'Behavior', lastViewed: '' },
    { name: 'Searches with no clicks', category: 'Behavior', lastViewed: '' },
    { name: 'Searches with no results', category: 'Behavior', lastViewed: '' },
    { name: 'Sessions by device type', category: 'Behavior', lastViewed: '' },
    { name: 'Sessions by landing page', category: 'Behavior', lastViewed: '' },
    { name: 'Shop Campaign ROAS', category: 'Behavior', lastViewed: '' },
    { name: 'Customer cohort analysis', category: 'Customers', lastViewed: '' },
    { name: 'Customers by location', category: 'Customers', lastViewed: '' },
    { name: 'New customer sales over time', category: 'Customers', lastViewed: '' },
    { name: 'New customers over time', category: 'Customers', lastViewed: '' },
    { name: 'New vs returning customers', category: 'Customers', lastViewed: '' },
    { name: 'One-time customers', category: 'Customers', lastViewed: '', link: true },
    { name: 'Predicted spend tiers', category: 'Customers', lastViewed: '', info: true, bell: true },
    { name: 'Returning customer rate over time', category: 'Customers', lastViewed: '' },
    { name: 'Returning customers', category: 'Customers', lastViewed: '' },
    { name: 'RFM customer analysis', category: 'Customers', lastViewed: '' },
    { name: 'RFM customer list', category: 'Customers', lastViewed: '' },
    { name: 'Chargeback rate', category: 'Finances', lastViewed: '' },
    { name: 'Cost of goods sold by order', category: 'Finances', lastViewed: '' },
    { name: 'Discounts by order', category: 'Finances', lastViewed: '' },
    { name: 'Finance Summary', category: 'Finances', lastViewed: '' },
    { name: 'Gross payments from Shopify Payments', category: 'Finances', lastViewed: '' },
    { name: 'Gross profit breakdown', category: 'Finances', lastViewed: '' },
    { name: 'Gross profit by order', category: 'Finances', lastViewed: '' },
    { name: 'Gross sales by order', category: 'Finances', lastViewed: '' },
    { name: 'Net payments by gateway', category: 'Finances', lastViewed: '' },
    { name: 'Net payments by method', category: 'Finances', lastViewed: '' },
    { name: 'Net payments by order', category: 'Finances', lastViewed: '' },
    { name: 'Net payments over time', category: 'Finances', lastViewed: '' },
    { name: 'Net sales by order', category: 'Finances', lastViewed: '' },
    { name: 'Net sales from gift cards', category: 'Finances', lastViewed: '' },
    { name: 'Net sales with cost by order', category: 'Finances', lastViewed: '' },
    { name: 'Net sales without cost by order', category: 'Finances', lastViewed: '' },
    { name: 'Outstanding gift card balance', category: 'Finances', lastViewed: '' },
    { name: 'Sessions by referrer', category: 'Acquisition', lastViewed: '' },
];

const categoryColors: Record<string, string> = {
    Orders: 'bg-[#fef3c7] text-[#92400e]',
    Acquisition: 'bg-[#e0f2fe] text-[#075985]',
    Behavior: 'bg-[#f3e8ff] text-[#6b21a8]',
    Customers: 'bg-[#dcfce7] text-[#166534]',
    Finances: 'bg-[#fce7f3] text-[#9d174d]',
};

function ShopifyIcon() {
    return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#96bf48] flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                <path d="M15.337 3.335c-.007-.052-.052-.08-.09-.087-.038-.007-1.062-.02-1.062-.02s-.843-.82-1.05-.927c-.207-.107-.407-.073-.407-.073l-.5 1.507S11.3 3.9 10.86 4.04c-.44.14-.52.16-.52.16-.47-1.527-1.3-2.2-1.3-2.2C8.48 1.3 7.64.98 6.82 1l-.22.01C6.36.72 5.9.5 5.36.5 3.38.5 2.4 2.76 2.1 4.01c-.84.26-1.43.44-1.5.47C.02 4.8 0 4.82 0 5.41L0 19.5l11.88 2.24L18 19.5V3.96c0-.04-.003-.08-.01-.12l-.01-.04zM11.84 4.04l-1.5.46c-.31-.95-.72-1.72-1.18-2.16.74.2 1.43.9 2.68 1.7zm-2.27-1.83c.09.33.21.79.3 1.3l-2.12.66c.4-1.37.9-2.05 1.82-2zm-1.2-.15c-.11.14-.22.31-.32.5-.52.94-.83 2.09-.9 2.76l-2.12.66c.35-1.51 1.35-3.64 3.34-3.92z" />
            </svg>
        </span>
    );
}

export default function Reports() {
    const [search, setSearch] = useState('');
    const [page] = useState(1);

    const filtered = allReports.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const pageSize = 50;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="min-h-full font-sans pb-10">
            <div className="w-full px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#1a1a1a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="3" y="12" width="7" height="9" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                        </svg>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a]">Reports</h1>
                    </div>
                    <button className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                        New exploration
                    </button>
                </div>

                {/* Search + Filters */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                        <div className="flex-1 flex items-center gap-2 bg-[#fafafa] border border-[#e8e8e8] rounded-lg px-3 py-1.5">
                            <Search className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search reports"
                                className="flex-1 bg-transparent text-[13px] focus:outline-none placeholder-[#9ca3af]"
                            />
                        </div>
                        <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] text-[#5c5f62]">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter pills */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0]">
                        {['Created by', 'Category', 'Includes'].map(f => (
                            <button key={f} className="flex items-center gap-1 text-[13px] font-medium text-[#1a1a1a] bg-[#f3f4f6] hover:bg-[#e5e7eb] px-2.5 py-1 rounded-md transition-colors">
                                {f} <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62]">Name</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[180px]">Category</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[180px]">
                                    <div className="flex items-center gap-1 cursor-pointer">
                                        Last viewed
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3l3 4H5l3-4zm0 10L5 9h6l-3 4z" /></svg>
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#5c5f62] w-[160px]">Created by</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((report, i) => (
                                <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[13px] ${report.link ? 'text-[#2563eb] underline cursor-pointer' : 'text-[#1a1a1a]'}`}>
                                                {report.name}
                                            </span>
                                            {report.info && (
                                                <svg className="w-3.5 h-3.5 text-[#9ca3af]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" strokeLinecap="round" /></svg>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${categoryColors[report.category] ?? 'bg-[#f3f4f6] text-[#5c5f62]'}`}>
                                            {report.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[13px] text-[#5c5f62]">{report.lastViewed}</td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <ShopifyIcon />
                                            <span className="text-[13px] text-[#1a1a1a]">Shopify</span>
                                            {report.bell && (
                                                <svg className="w-3.5 h-3.5 text-[#9ca3af] ml-auto opacity-0 group-hover:opacity-100" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a4 4 0 014 4v2l1 2H3l1-2V6a4 4 0 014-4zM6.5 12a1.5 1.5 0 003 0" strokeLinecap="round" /></svg>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center gap-2 px-4 py-3">
                        <button className="p-1 hover:bg-[#f5f5f5] rounded border border-[#e3e3e3] transition-colors text-[#5c5f62]">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-[#f5f5f5] rounded border border-[#e3e3e3] transition-colors text-[#5c5f62]">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="text-[13px] text-[#5c5f62]">1–50</span>
                    </div>

                    {/* Footer */}
                    <div className="py-3 text-center text-[13px] text-[#5c5f62] border-t border-[#f0f0f0]">
                        Learn more about the new reporting experience
                    </div>
                </div>
            </div>
        </div>
    );
}