import React from 'react';
import { Mail, Download } from 'lucide-react';

export default function Automations() {
    return (
        <div className="min-h-full font-sans bg-[#f1f2f4]">
            <div className="max-w-[1220px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <Mail className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Automations</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-20 min-h-[460px]">

                    <div className="w-[160px] h-[160px] bg-[#f3f6f8] rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute top-8 left-6 w-[40px] h-[40px] bg-[#3b82f6] rounded-lg shadow-sm border border-[#2563eb]"></div>
                        <div className="absolute bottom-8 right-6 w-[40px] h-[40px] bg-[#ef4444] rounded-lg shadow-sm border border-[#e11d48]"></div>
                        <div className="absolute bottom-6 left-10 w-[40px] h-[40px] bg-[#f59e0b] rounded-lg shadow-sm border border-[#d97706]"></div>
                        <div className="absolute top-10 right-8 w-[40px] h-[40px] bg-[#10b981] rounded-lg shadow-sm border border-[#059669]"></div>

                        <div className="w-[60px] h-[60px] bg-white rounded-xl shadow-md border border-[#e2e8f0] z-10 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[#94a3b8]" />
                        </div>
                    </div>

                    <h2 className="text-[15px] font-bold text-[#1a1a1a] mb-2 text-center">
                        You don't have this app installed
                    </h2>
                    <p className="text-[13px] text-[#5c5f62] mb-6 text-center">
                        Get Messaging and try again.
                    </p>

                    <div className="border border-[#e8e8e8] rounded-xl p-4 flex items-center justify-between w-[480px]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-300 rounded-lg flex items-center justify-center shadow-sm">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-semibold text-[#1a1a1a]">Shopify Messaging</h4>
                                <div className="flex items-center gap-1 text-[12px] text-[#5c5f62] mb-0.5">
                                    <span>4.7</span><span className="text-[#6b6b6b]">★</span>
                                </div>
                                <p className="text-[12px] text-[#5c5f62]">Email tools made to grow your business—no coding required</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-1.5 bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f7f7f7] shadow-sm">
                            <Download className="w-3.5 h-3.5" /> Install
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inline Plus icon for Automations
function Plus({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}