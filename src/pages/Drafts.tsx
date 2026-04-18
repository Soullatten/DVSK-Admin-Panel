import React, { useState } from 'react';
import { Search, Filter, Mail, Plus, FileEdit } from 'lucide-react';
import toast from 'react-hot-toast';

interface DraftOrder {
    id: string;
    date: string;
    customer: string;
    status: 'Open' | 'Invoice sent' | 'Completed';
    total: string;
}

const demoDrafts: DraftOrder[] = [
    { id: '#D1029', date: 'Today at 2:15 pm', customer: 'Alice Cooper', status: 'Open', total: '₹1,200' },
    { id: '#D1028', date: 'Today at 11:30 am', customer: 'Robert Fox', status: 'Invoice sent', total: '₹8,500' },
    { id: '#D1027', date: 'Yesterday at 4:20 pm', customer: 'Emma Watson', status: 'Completed', total: '₹3,400' },
    { id: '#D1026', date: 'Oct 14 at 9:00 am', customer: 'David Miller', status: 'Open', total: '₹450' },
];

export default function Drafts() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDrafts = demoDrafts.filter(draft =>
        draft.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif' }}>
            <div className="max-w-[1100px] mx-auto px-6 py-6">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <FileEdit className="w-[22px] h-[22px] text-[#1a1a1a]" strokeWidth={2} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Drafts</h1>
                    </div>
                    <button onClick={() => toast.success('Action clicked!')}  className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Create draft order
                    </button>
                </div>

                {/* Drafts Table */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-[#f0f0f0] flex items-center justify-between bg-[#fafafa]">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                                <input
                                    type="text"
                                    placeholder="Filter drafts"
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
                        {filteredDrafts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[#6b6b6b]">
                                <Search className="w-8 h-8 mb-3 text-[#d4d4d4]" />
                                <p className="text-[14px] font-medium text-[#1a1a1a]">No drafts found</p>
                                <p className="text-[13px]">Try changing your search or filters</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-[#f0f0f0]">
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a] w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Draft</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Date</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Customer</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Status</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">Total</th>
                                        <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[13px]">
                                    {filteredDrafts.map((draft) => (
                                        <tr key={draft.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors group">
                                            <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                            <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{draft.id}</td>
                                            <td className="px-4 py-3 text-[#6b6b6b]">{draft.date}</td>
                                            <td className="px-4 py-3 text-[#1a1a1a]">{draft.customer}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border
                          ${draft.status === 'Completed' ? 'bg-[#e0f5e9] border-[#b0e3c5] text-[#136b32]' :
                                                        draft.status === 'Invoice sent' ? 'bg-[#fef0d5] border-[#fce0ab] text-[#855a00]' :
                                                            'bg-[#f5f5f5] border-[#e8e8e8] text-[#4a4a4a]'}`}>
                                                    {draft.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#1a1a1a]">{draft.total}</td>
                                            <td className="px-4 py-3 text-right">
                                                {draft.status === 'Open' && (
                                                    <button onClick={() => toast.success('Action clicked!')}  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6b6b6b] hover:text-[#1a1a1a] flex items-center gap-1.5 ml-auto text-[12px] font-medium">
                                                        <Mail className="w-3.5 h-3.5" /> Send invoice
                                                    </button>
                                                )}
                                            </td>
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