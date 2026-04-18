import React from 'react';
import { Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Tag className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Products</h1>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-8 flex items-center justify-between">
                        <div className="max-w-sm">
                            <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Add your products</h2>
                            <p className="text-[13px] text-[#6b6b6b] mb-4">Start by stocking your store with products your customers will love</p>
                            <div className="flex gap-3">
                                <button onClick={() => toast.success('Action clicked!')} className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm">Add product</button>
                                <button onClick={() => toast.success('Action clicked!')} className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-all shadow-sm">Import</button>
                            </div>
                        </div>
                        <div className="w-[200px] h-[120px] bg-[#f5f5f5] rounded-xl flex items-center justify-center border border-[#e8e8e8]">
                            <Tag className="w-10 h-10 text-[#c4c4c4]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm p-8 flex items-center justify-between">
                        <div className="max-w-sm">
                            <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Find new products</h2>
                            <p className="text-[13px] text-[#6b6b6b] mb-4">Install a sourcing app to find products to sell without holding inventory</p>
                            <button onClick={() => toast.success('Action clicked!')} className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-all shadow-sm">Browse sourcing apps</button>
                        </div>
                        <div className="w-[200px] h-[120px] bg-[#f5f5f5] rounded-xl flex items-center justify-center border border-[#e8e8e8] overflow-hidden relative">
                            <div className="grid grid-cols-3 gap-2 opacity-50 p-2">
                                {[...Array(9)].map((_, i) => <div key={i} className="w-12 h-12 bg-[#e3e3e3] rounded shadow-sm"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}