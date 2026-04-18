import React, { useState } from 'react';
import { Building2, Info, X } from 'lucide-react';

export default function Companies() {
    const [showBanner, setShowBanner] = useState(true);

    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1220px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-4">
                    <Building2 className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Companies</h1>
                </div>

                {showBanner && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-[#c9def7] shadow-sm">
                        <div className="bg-[#9ed0ff] px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#15324b]">
                                <Info className="w-4 h-4" />
                                <span className="text-[14px] font-semibold">App behavior with B2B orders</span>
                            </div>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="text-[#15324b] hover:bg-[#8ac4fb] rounded-md p-1 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white px-4 py-4">
                            <p className="text-[14px] text-[#404448]">
                                Some apps may not attribute B2B orders correctly on your current plan. Check that B2B orders are
                                assigned to a company, not just an individual customer. If you notice orders are not assigned to a
                                company, contact the app developer.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col items-center justify-center py-20 min-h-[360px]">
                    <div className="w-[140px] h-[140px] rounded-full bg-[#f3f6f8] flex items-center justify-center mb-6 relative">
                        <div className="w-[82px] h-[112px] rounded-xl bg-[#69b8b7] shadow-sm overflow-hidden border border-[#dfe5e8]">
                            <div className="h-5 bg-[#4ea3a2]"></div>
                            <div className="px-2 pt-2">
                                <div className="h-1.5 rounded bg-white/90 mb-2"></div>
                                <div className="h-1.5 rounded bg-[#d9e4ea] mb-2"></div>
                                <div className="h-1.5 rounded bg-[#d9e4ea] mb-2"></div>
                                <div className="mt-3 h-8 rounded bg-[#f0785a]"></div>
                            </div>
                        </div>

                        <div className="absolute right-[18px] top-[26px] w-[46px] h-[88px] bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-2">
                            <div className="h-1.5 rounded bg-[#e5e7eb] mb-2"></div>
                            <div className="h-1.5 rounded bg-[#e5e7eb] mb-2"></div>
                            <div className="h-1.5 rounded bg-[#e5e7eb] mb-5"></div>
                            <div className="h-3 rounded-full bg-[#1f8a70]"></div>
                        </div>
                    </div>

                    <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-2 text-center max-w-[520px]">
                        Bring the power of customization to your B2B business
                    </h2>
                    <p className="text-[14px] text-[#5c5f62] mb-5 text-center max-w-[620px] leading-6">
                        Everything you need for B2B in one place. Get started by adding a company and assigning custom pricing,
                        net payment terms, and permissions for multiple locations and buyers.
                    </p>

                    <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#1f1f1f] transition-colors">
                        Add company
                    </button>
                </div>

                <div className="text-center mt-6">
                    <a href="#" className="text-[13px] text-[#3f4246] hover:underline">
                        Learn more about companies
                    </a>
                </div>
            </div>
        </div>
    );
}