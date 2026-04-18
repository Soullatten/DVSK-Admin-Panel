import React from 'react';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inventory() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Package className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Inventory</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-24">
                    <div className="w-24 h-24 bg-[#e8f4f4] rounded-full flex items-center justify-center mb-6 relative">
                        <Package className="w-12 h-12 text-[#2c6e6e]" />
                        <div className="absolute -bottom-2 bg-white px-3 py-1 rounded-full border border-[#e8e8e8] text-[12px] font-bold shadow-sm">17</div>
                    </div>
                    <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Keep track of your inventory</h2>
                    <p className="text-[13px] text-[#6b6b6b] mb-6 max-w-[400px] text-center">When you enable inventory tracking on your products, you can view and adjust their inventory counts here.</p>
                    <button onClick={() => toast.success('Action clicked!')}  className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-all shadow-sm">Go to products</button>
                </div>

                <div className="text-center mt-4">
                    <a href="#" className="text-[13px] text-[#6b6b6b] hover:underline">Learn more about managing inventory</a>
                </div>
            </div>
        </div>
    );
}