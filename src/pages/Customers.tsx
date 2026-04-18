import React from 'react';
import { User, UserPlus } from 'lucide-react';

export default function Customers() {
    return (
        <div className="min-h-full font-sans">
            <div className="max-w-[1220px] mx-auto px-6 py-6">
                <div className="flex items-center gap-2.5 mb-6">
                    <User className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
                    <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Customers</h1>
                </div>

                <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
                    <div className="px-8 py-10 flex items-center justify-between min-h-[320px]">
                        <div className="max-w-[520px]">
                            <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-2">
                                Everything customers-related in one place
                            </h2>
                            <p className="text-[14px] text-[#5c5f62] mb-5">
                                Manage customer details, see customer order history, and group customers into segments.
                            </p>

                            <div className="flex gap-3">
                                <button className="bg-[#303030] text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#1f1f1f] transition-colors">
                                    Add customer
                                </button>
                                <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
                                    Import customers
                                </button>
                            </div>
                        </div>

                        <div className="w-[220px] h-[160px] rounded-2xl bg-[#f7fafc] flex items-center justify-center">
                            <div className="relative">
                                <div className="w-[120px] h-[120px] rounded-full bg-[#edf2f7] flex items-center justify-center">
                                    <div className="w-[82px] h-[110px] rounded-xl bg-[#8fd0dc] relative overflow-hidden shadow-sm">
                                        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                                            <UserPlus className="w-10 h-10 text-[#2f3a45]" strokeWidth={1.8} />
                                        </div>
                                        <div className="absolute right-[-12px] top-[12px] w-[48px] h-[84px] bg-white rounded-lg shadow-sm border border-[#e8e8e8]">
                                            <div className="mt-3 mx-3 h-2 rounded bg-[#e5e7eb]"></div>
                                            <div className="mt-2 mx-3 h-2 rounded bg-[#e5e7eb]"></div>
                                            <div className="mt-6 mx-3 h-3 rounded-full bg-[#1f8a70]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#eef0f2] bg-[#fafafa] px-8 py-7">
                        <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Get customers with apps</h3>
                        <p className="text-[13px] text-[#5c5f62] mb-4 max-w-[520px]">
                            Grow your customer list by adding a lead capture form to your store and marketing.
                        </p>
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
                            See app recommendations
                        </button>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <a href="#" className="text-[13px] text-[#3f4246] hover:underline">
                        Learn more about customers
                    </a>
                </div>
            </div>
        </div>
    );
}