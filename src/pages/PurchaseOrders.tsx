import React from 'react';
import { FileText, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseOrders() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <FileText className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Purchase orders</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-24">
                    <div className="w-24 h-24 bg-[#fff3db] rounded-full flex items-center justify-center mb-6">
                        <ClipboardList className="w-12 h-12 text-[#b07f23]" />
                    </div>
                    <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Manage your purchase orders</h2>
                    <p className="text-[13px] text-[#6b6b6b] mb-6 max-w-[400px] text-center">Track and receive inventory ordered from suppliers.</p>
                    <button onClick={() => toast.success('Action clicked!')}  className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-all shadow-sm">Create purchase order</button>
                </div>

                <div className="text-center mt-4">
                    <a href="#" className="text-[13px] text-[#6b6b6b] hover:underline">Learn more about purchase orders</a>
                </div>
            </div>
        </div>
    );
}