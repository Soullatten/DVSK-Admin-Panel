import React from 'react';
import { Tag, Search, ArrowUpDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Collections() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <Tag className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Collections</h1>
                    </div>
                    <button onClick={() => toast.success('Action clicked!')}  className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm">Add collection</button>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="border-b border-[#f0f0f0] flex items-center justify-between bg-white px-2 pt-2">
                        <div className="flex items-center gap-1">
                            <button onClick={() => toast.success('Action clicked!')}  className="px-3 py-1.5 text-[13px] font-semibold text-[#1a1a1a] bg-[#f5f5f5] rounded-md">All</button>
                            <button onClick={() => toast.success('Action clicked!')}  className="px-3 py-1.5 text-[13px] text-[#6b6b6b] hover:bg-[#f5f5f5] rounded-md"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-2 pb-2 pr-2">
                            <button onClick={() => toast.success('Action clicked!')}  className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3]"><Search className="w-4 h-4 text-[#1a1a1a]" /></button>
                            <button onClick={() => toast.success('Action clicked!')}  className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3]"><ArrowUpDown className="w-4 h-4 text-[#1a1a1a]" /></button>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#f0f0f0]">
                                <th className="px-4 py-2.5 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-[#6b6b6b]">Title</th>
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-[#6b6b6b]">Products</th>
                                <th className="px-4 py-2.5 text-[12px] font-semibold text-[#6b6b6b]">Product conditions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px]">
                            <tr className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors cursor-pointer">
                                <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                                <td className="px-4 py-3 font-semibold text-[#1a1a1a] flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#f5f5f5] border border-[#e3e3e3] rounded flex items-center justify-center"><Tag className="w-3.5 h-3.5 text-[#8a8a8a]" /></div>
                                    Home page
                                </td>
                                <td className="px-4 py-3 text-[#1a1a1a]">0</td>
                                <td className="px-4 py-3 text-[#1a1a1a]"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="text-center mt-4">
                    <a href="#" className="text-[13px] text-[#6b6b6b] hover:underline">Learn more about collections</a>
                </div>
            </div>
        </div>
    );
}