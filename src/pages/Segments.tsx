import React, { useState } from 'react';
import { Search, Users2, ChevronDown, MoreHorizontal } from 'lucide-react';

interface SegmentItem {
    id: number;
    name: string;
    percent: string;
    lastActivity: string;
    createdBy: string;
}

const demoSegments: SegmentItem[] = [
    {
        id: 1,
        name: 'Customers who have purchased at least once',
        percent: '',
        lastActivity: 'Created on Apr 15, 2026',
        createdBy: 'Shopify',
    },
    {
        id: 2,
        name: 'Email subscribers',
        percent: '',
        lastActivity: 'Created on Apr 15, 2026',
        createdBy: 'Shopify',
    },
    {
        id: 3,
        name: 'Abandoned checkouts in the last 30 days',
        percent: '',
        lastActivity: 'Created on Apr 15, 2026',
        createdBy: 'Shopify',
    },
    {
        id: 4,
        name: 'Customers who have purchased more than once',
        percent: '',
        lastActivity: 'Created on Apr 15, 2026',
        createdBy: 'Shopify',
    },
    {
        id: 5,
        name: "Customers who haven't purchased",
        percent: '',
        lastActivity: 'Created on Apr 15, 2026',
        createdBy: 'Shopify',
    },
];

export default function Segments() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSegments = demoSegments.filter((segment) =>
        segment.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1220px] mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <Users2 className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Segments</h1>
                    </div>

                    <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#1f1f1f] transition-colors">
                        Create segment
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-[#eef0f2]">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                            <input
                                type="text"
                                placeholder="Search segments"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-[#e3e3e3] rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#8a8a8a] focus:ring-1 focus:ring-[#8a8a8a]"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#eef0f2]">
                                <th className="px-4 py-3 w-12">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#6b6b6b]">Name</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#6b6b6b]">% of customers</th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#6b6b6b]">
                                    <span className="inline-flex items-center gap-1">
                                        Last activity
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-[12px] font-semibold text-[#6b6b6b]">Created by</th>
                                <th className="px-4 py-3 w-12"></th>
                            </tr>
                        </thead>

                        <tbody className="text-[13px]">
                            {filteredSegments.map((segment) => (
                                <tr key={segment.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                                    <td className="px-4 py-4">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </td>
                                    <td className="px-4 py-4 text-[#1a1a1a] font-medium">{segment.name}</td>
                                    <td className="px-4 py-4 text-[#4a4a4a]">{segment.percent}</td>
                                    <td className="px-4 py-4 text-[#4a4a4a]">{segment.lastActivity}</td>
                                    <td className="px-4 py-4 text-[#4a4a4a]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[18px]">💵</span>
                                            {segment.createdBy}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="p-1 hover:bg-[#f1f1f1] rounded-md">
                                            <MoreHorizontal className="w-4 h-4 text-[#6b6b6b]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-center mt-6">
                    <a href="#" className="text-[13px] text-[#3f4246] hover:underline">
                        Learn more about segments
                    </a>
                </div>
            </div>
        </div>
    );
}