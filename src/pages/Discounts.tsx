import React from 'react';
import { Percent, Scissors, Download } from 'lucide-react';

export default function Discounts() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1220px] mx-auto px-6 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <Percent className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Discounts</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#5c5f62] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] transition-colors shadow-sm opacity-60 cursor-not-allowed">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#1f1f1f] transition-colors">
                            Create discount
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-24 min-h-[460px]">

                    {/* Custom Scissors & Coupon Graphic */}
                    <div className="w-[160px] h-[160px] bg-[#f3f6f8] rounded-full flex items-center justify-center mb-6 relative">

                        {/* Orange Coupon Ticket */}
                        <div className="absolute top-[35px] left-[30px] w-[90px] h-[54px] bg-[#df9c40] rounded-sm flex items-center justify-start pl-3 shadow-sm rotate-[-4deg]">
                            <span className="text-white font-bold text-[22px]">%</span>
                            {/* Perforated edge line */}
                            <div className="absolute right-[22px] top-1 bottom-1 w-[2px] border-r-2 border-dashed border-[#c6822c]"></div>
                        </div>

                        {/* Scissors Graphic */}
                        <div className="absolute top-[45px] left-[65px] rotate-[15deg]">
                            {/* Blades */}
                            <div className="relative">
                                <div className="w-[14px] h-[60px] bg-[#c5c8d1] rounded-t-full absolute -left-[5px] -top-[40px] origin-bottom rotate-[-15deg] shadow-sm"></div>
                                <div className="w-[14px] h-[60px] bg-[#e1e3e8] rounded-t-full absolute left-[5px] -top-[40px] origin-bottom rotate-[15deg] shadow-sm"></div>

                                {/* Center Pivot Pin */}
                                <div className="w-2.5 h-2.5 bg-white rounded-full absolute left-[3.5px] top-[14px] shadow-sm z-10"></div>

                                {/* Handles */}
                                <div className="absolute top-[20px] -left-[18px] w-[22px] h-[34px] border-[5px] border-[#369584] rounded-full rotate-[15deg]"></div>
                                <div className="absolute top-[20px] left-[10px] w-[22px] h-[34px] border-[5px] border-[#369584] rounded-full rotate-[-15deg]"></div>
                            </div>
                        </div>

                    </div>

                    <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-2 text-center">
                        Manage discounts and promotions
                    </h2>
                    <p className="text-[14px] text-[#5c5f62] mb-6 text-center max-w-[480px]">
                        Add discount codes and automatic discounts that apply at checkout.<br />
                        You can also use discounts with <a href="#" className="underline hover:text-[#1a1a1a]">compare at prices</a>.
                    </p>

                    <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#1f1f1f] transition-colors">
                        Create discount
                    </button>
                </div>

                {/* Footer Link */}
                <div className="text-center mt-6">
                    <a href="#" className="text-[13px] text-[#3f4246] hover:underline">
                        Learn more about discounts
                    </a>
                </div>

            </div>
        </div>
    );
}