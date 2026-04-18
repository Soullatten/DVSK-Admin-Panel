import React from 'react';
import { Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GiftCards() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Gift className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Gift cards</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-24">
                    <div className="w-24 h-24 bg-[#d0eaea] rounded-2xl flex items-center justify-center mb-6">
                        <Gift className="w-12 h-12 text-[#2c6e6e]" />
                    </div>
                    <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Start selling gift cards</h2>
                    <p className="text-[13px] text-[#6b6b6b] mb-6 max-w-[400px] text-center">Add gift card products to sell or create gift cards and send them directly to your customers.</p>

                    <div className="flex gap-3 mb-4">
                        <button onClick={() => toast.success('Action clicked!')}  className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#f5f5f5] transition-all shadow-sm">Create gift card</button>
                        <button onClick={() => toast.success('Action clicked!')}  className="bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-black transition-all shadow-sm">Add gift card product</button>
                    </div>
                    <p className="text-[12px] text-[#6b6b6b]">By using gift cards, you agree to our <a href="#" className="underline">Terms of Service</a></p>
                </div>

                <div className="text-center mt-4">
                    <a href="#" className="text-[13px] text-[#6b6b6b] hover:underline">Learn more about gift cards</a>
                </div>
            </div>
        </div>
    );
}