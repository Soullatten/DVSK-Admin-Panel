import React from 'react';
import {
  Plus, Pencil, ArrowUpCircle, Sparkles,
  Lock, Copy, Tag
} from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-[860px] mx-auto px-8 py-6">

      <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-5 tracking-tight">
        Good morning, let's get started.
      </h1>

      {/* Ask anything */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8e8e8] mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 focus:outline-none text-[14px] text-[#1a1a1a] placeholder-[#9a9a9a]"
          />
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-[#f5f5f5] rounded-lg transition-colors">
              <Plus className="h-4 w-4 text-[#6b6b6b]" />
            </button>
            <button className="p-1.5 hover:bg-[#f5f5f5] rounded-lg transition-colors">
              <ArrowUpCircle className="h-5 w-5 text-[#c4c4c4]" />
            </button>
          </div>
        </div>
        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="w-5 h-5 bg-[#f0e8ff] rounded-full flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-[#7c3aed]" />
          </div>
          <span className="text-[12px] text-[#8a8a8a]">Powered by Magic</span>
        </div>
      </div>

      {/* Setup Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8e8e8] p-5">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Add store name</h2>
          <button className="p-1 hover:bg-[#f5f5f5] rounded-md transition-colors">
            <Pencil className="h-3.5 w-3.5 text-[#8a8a8a]" />
          </button>
        </div>

        {/* Top 2 Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-[#efefef] hover:border-[#d4d4d4] hover:shadow-md transition-all cursor-pointer flex flex-col group overflow-hidden">
            <div className="h-[160px] bg-[#f7f7f7] flex items-center justify-center relative overflow-hidden">
              <div className="absolute -left-4 top-2 w-24 h-24 bg-[#ffe4cc] rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute right-0 bottom-0 w-20 h-20 bg-[#ffd6cc] rounded-full opacity-40 blur-2xl"></div>
              <div className="w-[88px] h-[88px] bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-[#efefef] flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
                <Tag className="h-9 w-9 text-[#d4d4d4]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[14px] text-[#1a1a1a] mb-1.5">Add your first product</h3>
              <p className="text-[13px] text-[#6b6b6b] mb-4 leading-relaxed">
                Start by adding a product and a few key details. Not ready?{' '}
                <a href="#" className="text-[#2563eb] hover:underline font-medium">Start with a sample product</a>
              </p>
              <div className="flex items-center gap-2.5">
                <button className="bg-[#1a1a1a] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm">Add product</button>
                <button className="text-[13px] font-medium text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">Import</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#efefef] hover:border-[#d4d4d4] hover:shadow-md transition-all cursor-pointer flex flex-col group overflow-hidden">
            <div className="h-[160px] bg-[#f7f7f7] flex items-center justify-center relative overflow-hidden">
              <div className="absolute -right-4 top-2 w-24 h-24 bg-[#cce0ff] rounded-full opacity-60 blur-2xl"></div>
              <div className="absolute left-0 bottom-0 w-20 h-20 bg-[#d4f0ff] rounded-full opacity-40 blur-2xl"></div>
              <div className="w-[128px] h-[90px] bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-[#efefef] flex p-3 gap-2 z-10 group-hover:scale-105 transition-transform duration-300">
                <div className="flex flex-col gap-1.5 w-[28%] pt-1">
                  <div className="w-full h-2 bg-[#f0f0f0] rounded-full"></div>
                  <div className="w-[80%] h-2 bg-[#f0f0f0] rounded-full"></div>
                  <div className="w-[90%] h-2 bg-[#f0f0f0] rounded-full"></div>
                </div>
                <div className="flex-1 h-full bg-[#f5f5f5] rounded-lg flex items-center justify-center border border-[#efefef]">
                  <span className="text-[#b0b0b0] font-bold text-xl">Aa</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[14px] text-[#1a1a1a] mb-1.5">Customize your online store</h3>
              <p className="text-[13px] text-[#6b6b6b] mb-4 leading-relaxed">
                Choose or generate a custom theme, then add your logo, colors, and images.
              </p>
              <button className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[12px] font-semibold px-3.5 py-1.5 rounded-lg hover:bg-[#f9f9f9] transition-all shadow-sm">Customize theme</button>
            </div>
          </div>
        </div>

        {/* Bottom 3 Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#efefef] hover:border-[#d4d4d4] hover:shadow-md p-4 transition-all cursor-pointer flex flex-col">
            <h3 className="font-semibold text-[13px] text-[#1a1a1a] mb-3">Set up a payment provider</h3>
            <div className="flex items-center gap-1.5 mb-5">
              <div className="h-[26px] px-2 bg-[#003087] rounded-[4px] flex items-center justify-center text-white text-[9px] font-bold italic shadow-sm">PayPal</div>
              <div className="h-[26px] px-2 bg-white border border-[#e3e3e3] rounded-[4px] flex items-center justify-center text-[#1434CB] text-[10px] font-bold shadow-sm">VISA</div>
              <div className="h-[26px] w-[38px] bg-white border border-[#e3e3e3] rounded-[4px] flex items-center justify-center shadow-sm">
                <div className="w-[13px] h-[13px] bg-[#EB001B] rounded-full -mr-1.5 z-10"></div>
                <div className="w-[13px] h-[13px] bg-[#F79E1B] rounded-full"></div>
              </div>
            </div>
            <button className="mt-auto bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9f9f9] transition-all shadow-sm w-fit">Activate</button>
          </div>

          <div className="rounded-xl border border-[#efefef] hover:border-[#d4d4d4] hover:shadow-md p-4 transition-all cursor-pointer flex flex-col">
            <h3 className="font-semibold text-[13px] text-[#1a1a1a] mb-3">Review your shipping rates</h3>
            <div className="mb-5 flex items-center">
              <div className="w-[38px] h-[26px] bg-white border border-[#e3e3e3] rounded-[4px] overflow-hidden flex flex-col shadow-sm">
                <div className="h-1/3 bg-[#FF9933]"></div>
                <div className="h-1/3 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 border border-[#000080] rounded-full"></div>
                </div>
                <div className="h-1/3 bg-[#138808]"></div>
              </div>
            </div>
            <button className="mt-auto bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9f9f9] transition-all shadow-sm w-fit">Review</button>
          </div>

          <div className="rounded-xl border border-[#efefef] hover:border-[#d4d4d4] hover:shadow-md p-4 transition-all cursor-pointer flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-[13px] text-[#1a1a1a]">Customize domain</h3>
              <span className="bg-[#f5f5f5] border border-[#e3e3e3] text-[#4a4a4a] text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-semibold whitespace-nowrap">
                <Lock className="w-2.5 h-2.5" /> Get $20
              </span>
            </div>
            <div className="bg-[#f9f9f9] border border-[#e8e8e8] rounded-lg px-2.5 py-1.5 text-[11px] text-[#6b6b6b] mb-4 flex items-center justify-between">
              <span className="truncate font-mono">1quv0n-jd.myshopify.com</span>
              <Copy className="w-3.5 h-3.5 text-[#9a9a9a] flex-shrink-0 ml-1" />
            </div>
            <button className="mt-auto bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f9f9f9] transition-all shadow-sm w-fit">Customize</button>
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-[#8a8a8a] flex items-center justify-center gap-1.5 mt-8 pb-10 font-medium">
        <Sparkles className="w-3 h-3" /> New insights and guides will appear here as we learn more about your store
      </p>
    </div>
  );
}