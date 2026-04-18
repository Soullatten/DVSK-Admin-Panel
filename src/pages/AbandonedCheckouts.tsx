import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Checkout {
    id: string;
    date: string;
    customer: string;
    emailStatus: 'Sent' | 'Not sent' | 'Scheduled';
    recoveryStatus: 'Recovered' | 'Not recovered';
    total: string;
}

const demoCheckouts: Checkout[] = [
    { id: '#1103239', date: 'Today at 3:45 pm', customer: 'michael.j@example.com', emailStatus: 'Scheduled', recoveryStatus: 'Not recovered', total: '₹5,200' },
    { id: '#1103238', date: 'Today at 1:12 pm', customer: 'sarah.smith@example.com', emailStatus: 'Sent', recoveryStatus: 'Recovered', total: '₹1,850' },
    { id: '#1103237', date: 'Yesterday at 8:20 am', customer: 'unknown (Guest)', emailStatus: 'Not sent', recoveryStatus: 'Not recovered', total: '₹800' },
    { id: '#1103236', date: 'Oct 14 at 6:40 pm', customer: 'alex.w@example.com', emailStatus: 'Sent', recoveryStatus: 'Not recovered', total: '₹12,400' },
];

export default function AbandonedCheckouts() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCheckouts = demoCheckouts.filter(checkout =>
        checkout.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkout.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif' }}>
            <div className="max-w-[1100px] mx-auto px-6 py-6">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5 text-[#1a1a1a]">
                        {/* The Custom Cart X Icon */}
                        <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1.5"></circle>
                            <circle cx="20" cy="21" r="1.5"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            <line x1="11" y1="10" x2="16" y2="15"></line>
                            <line x1="16" y1="10" x2="11" y2="15"></line>
                        </svg>
                        <h1 className="text-[22px] font-bold tracking-tight">Abandoned checkouts</h1>
                    </div>
                </div>

                {/* Checkouts Table */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-[#f0f0f0] flex items-center justify-between bg-[#fafafa]">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                                <input
                                    type="text"
                                    placeholder="Filter checkouts"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-[#e3e3e3] rounded-md pl-9 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#8a8a8a] focus:ring-1 focus:ring-[#8a8a8a] transition-all shadow-sm"
                                />
                            </div>
                            <button onClick={() => toast.success('Action clicked!')}  className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-md hover:bg-[#f5f5f5] flex items-center gap-2 shadow-sm transition-colors">
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {filteredCheckouts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[#6b6b6b]">
                                <Search className="w-8 h-8 mb-3 text-[#d4d4d4]" />
                                <p className="text-[14px] font-medium text-[#1a1a1a]">No abandoned checkouts found</p>
                                <p className="text-[13px]">Try changing your search or filters</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-[#f0f0f0]">
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a] w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Checkout</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Date</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Placed by</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Email status</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Recovery status</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[13px]">
                                    {filteredCheckouts.map((checkout) => (
                                        <tr key={checkout.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors group cursor-pointer">
                                            <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                            <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{checkout.id}</td>
                                            <td className="px-4 py-3 text-[#6b6b6b]">{checkout.date}</td>
                                            <td className="px-4 py-3 text-[#1a1a1a]">{checkout.customer}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border
                          ${checkout.emailStatus === 'Sent' ? 'bg-[#e0f5e9] border-[#b0e3c5] text-[#136b32]' :
                                                        checkout.emailStatus === 'Scheduled' ? 'bg-[#e0f0ff] border-[#b8daff] text-[#004e9a]' :
                                                            'bg-[#f5f5f5] border-[#e8e8e8] text-[#4a4a4a]'}`}>
                                                    {checkout.emailStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border
                          ${checkout.recoveryStatus === 'Recovered' ? 'bg-[#e0f5e9] border-[#b0e3c5] text-[#136b32]' :
                                                        'bg-[#f5f5f5] border-[#e8e8e8] text-[#4a4a4a]'}`}>
                                                    {checkout.recoveryStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#1a1a1a] font-medium">{checkout.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}