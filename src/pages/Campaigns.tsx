import React from 'react';
import { Folder } from 'lucide-react';

export default function Campaigns() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1220px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Folder className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Campaigns</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm mb-4">
                    <div className="border-b border-[#f0f0f0] px-2 pt-2 flex items-center justify-between">
                        <button className="px-3 py-1.5 text-[13px] font-semibold text-[#1a1a1a] bg-[#f5f5f5] rounded-md">All</button>
                        <div className="pb-2 pr-2">
                            <button className="p-1.5 hover:bg-[#f5f5f5] rounded-md border border-[#e3e3e3] bg-white text-[#5c5f62]"><span className="text-[12px] font-semibold px-1">↑↓</span></button>
                        </div>
                    </div>

                    <div className="p-8 flex items-center justify-between border-b border-[#e8e8e8]">
                        <div className="max-w-[460px]">
                            <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Centralize your campaign tracking</h3>
                            <p className="text-[13px] text-[#5c5f62] mb-4 leading-relaxed">Create campaigns to evaluate how marketing initiatives drive business goals. Capture online and offline touchpoints, add campaign activities from multiple marketing channels, and monitor results.</p>
                            <div className="flex gap-3">
                                <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#1f1f1f]">Create campaign</button>
                                <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">Learn more</button>
                            </div>
                        </div>
                        <div className="w-[160px] h-[120px] relative flex items-center justify-center">
                            <div className="w-[120px] h-[80px] bg-[#3b82f6] rounded-lg shadow-sm flex items-center justify-center relative z-10 border border-[#2563eb]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 border-[4px] border-[#60a5fa] border-l-[#facc15] rounded-full"></div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="w-8 h-1.5 bg-[#60a5fa] rounded"></div>
                                        <div className="w-6 h-1.5 bg-[#60a5fa] rounded"></div>
                                        <div className="w-10 h-1.5 bg-[#60a5fa] rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-10 w-[60px] h-[70px] bg-[#f8fafc] rounded-lg shadow border border-[#e2e8f0] z-0 flex items-start justify-center pt-2">
                                <div className="w-8 h-8 border border-[#cbd5e1] rounded-sm flex items-center justify-center bg-white"><div className="text-[10px] text-[#94a3b8]">QR</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Generate traffic with marketing apps</h3>
                        <p className="text-[13px] text-[#5c5f62] mb-4 leading-relaxed max-w-[600px]">Grow your audience on social platforms, capture new leads with newsletter sign-ups, increase conversion with chat, and more.</p>
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">Browse marketing apps</button>
                    </div>
                </div>
            </div>
        </div>
    );
}