import React, { useState, useEffect } from 'react';
import { 
  Percent, Download, Plus, Search, Tag, X, 
  Filter, Copy, Trash2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types ──
type DiscountType = 'Percentage' | 'Fixed Amount' | 'Free Shipping';
type DiscountStatus = 'Active' | 'Scheduled' | 'Expired';

interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: string;
  status: DiscountStatus;
  used: number;
  startDate: string;
}

export default function Discounts() {
  const { data: liveData } = useMainWebsite('/discounts');

  // State
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Scheduled' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Animation States
  const [isSnipping, setIsSnipping] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<DiscountType>('Percentage');
  const [newValue, setNewValue] = useState('');

  // Handlers
  const handleExport = () => {
    if (discounts.length === 0) return toast.error("No discounts to export.");
    toast.success("Discounts exported to CSV!");
  };

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || (!newValue && newType !== 'Free Shipping')) return toast.error("Please fill out all fields.");

    const newDiscount: Discount = {
      id: Date.now().toString(),
      code: newCode.toUpperCase(),
      type: newType,
      value: newType === 'Percentage' ? `${newValue}%` : newType === 'Fixed Amount' ? `₹${newValue}` : 'Free',
      status: 'Active',
      used: 0,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setDiscounts([newDiscount, ...discounts]);
    setIsModalOpen(false);
    setNewCode('');
    setNewValue('');
    toast.success(`Discount code ${newDiscount.code} created!`);
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscounts(discounts.map(d => {
      if (d.id === id) {
        const newStatus = d.status === 'Active' ? 'Expired' : 'Active';
        toast.success(`${d.code} is now ${newStatus}`);
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  const deleteDiscount = (id: string, code: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
    toast.error(`${code} deleted.`);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${code} copied to clipboard!`, { icon: <Copy className="w-4 h-4 text-purple-400" /> });
  };

  // Easter Egg: Generate Demo Data
  const spawnDemoData = () => {
    if (discounts.length > 0) return;
    setDiscounts([
      { id: '1', code: 'SUMMER26', type: 'Percentage', value: '20%', status: 'Active', used: 142, startDate: 'May 01, 2026' },
      { id: '2', code: 'WELCOME10', type: 'Fixed Amount', value: '₹100', status: 'Active', used: 850, startDate: 'Jan 15, 2026' },
      { id: '3', code: 'FLASHFREE', type: 'Free Shipping', value: 'Free', status: 'Expired', used: 45, startDate: 'Apr 20, 2026' }
    ]);
    toast.success("Demo data loaded!");
  };

  // Filtering
  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-full font-sans text-[#ececec] pb-10">
      <div className="w-full max-w-[1400px] px-6 lg:px-8 py-8 mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={spawnDemoData}
              className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(192,132,252,0.2)]"
              title="Click to load demo data"
            >
              <Percent className="w-5 h-5 text-purple-400" />
            </motion.div>
            <div>
              <h1 className="text-[24px] font-bold text-white tracking-tight">Discounts</h1>
              <p className="text-[14px] text-[#888] mt-1">Manage promo codes and automatic discounts.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-[14px] font-bold shadow-[0_0_15px_rgba(192,132,252,0.3)] flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create discount
            </motion.button>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-6">
          {(['All', 'Active', 'Scheduled', 'Expired'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-purple-400' : 'text-[#888] hover:text-white'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="discountTabActive" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
          
          <AnimatePresence mode="wait">
            {discounts.length === 0 ? (
              /* ── EMPTY STATE WITH INTERACTIVE GRAPHIC ── */
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center py-20 px-6 absolute inset-0"
              >
                
                {/* Interactive Scissors & Neon Coupon Graphic */}
                <motion.div 
                  className="w-[180px] h-[180px] bg-purple-500/5 border border-purple-500/10 rounded-full flex items-center justify-center mb-8 relative shadow-[inset_0_0_40px_rgba(192,132,252,0.05)] cursor-pointer"
                  onMouseEnter={() => setIsSnipping(true)}
                  onMouseLeave={() => setIsSnipping(false)}
                  onClick={() => { setIsSnipping(true); setTimeout(() => setIsSnipping(false), 300); }}
                  title="Hover to snip!"
                >
                  
                  {/* Purple Neon Coupon Ticket */}
                  <motion.div 
                    animate={isSnipping ? { x: [-3, 3, -3], rotate: [-6, -4, -6] } : { x: 0, rotate: -6 }}
                    transition={{ repeat: isSnipping ? Infinity : 0, duration: 0.2 }}
                    className="absolute top-[45px] left-[35px] w-[100px] h-[60px] bg-[#1a1a1a] border border-purple-500/50 rounded-lg flex items-center justify-start pl-4 shadow-[0_0_20px_rgba(192,132,252,0.3)] overflow-hidden"
                  >
                    <span className="text-purple-400 font-bold text-[28px]">%</span>
                    <div className="absolute right-[24px] top-0 bottom-0 w-px border-r-2 border-dashed border-purple-500/30"></div>
                  </motion.div>

                  {/* Animated Scissors */}
                  <div className="absolute top-[55px] left-[75px] rotate-[15deg] drop-shadow-2xl origin-center">
                    <div className="relative">
                      {/* Bottom Blade (moves up) */}
                      <motion.div 
                        animate={isSnipping ? { rotate: [15, -2, 15] } : { rotate: 15 }}
                        transition={{ repeat: isSnipping ? Infinity : 0, duration: 0.3 }}
                        className="w-[16px] h-[65px] bg-gradient-to-b from-[#fff] to-[#aaa] rounded-t-full absolute left-[6px] -top-[45px] origin-bottom shadow-lg z-20"
                      />
                      
                      {/* Top Blade (moves down) */}
                      <motion.div 
                        animate={isSnipping ? { rotate: [-15, 2, -15] } : { rotate: -15 }}
                        transition={{ repeat: isSnipping ? Infinity : 0, duration: 0.3 }}
                        className="w-[16px] h-[65px] bg-gradient-to-b from-[#e1e3e8] to-[#888] rounded-t-full absolute -left-[6px] -top-[45px] origin-bottom shadow-inner z-10"
                      />
                      
                      {/* Center Pivot Pin */}
                      <div className="w-3 h-3 bg-[#111] border border-[#444] rounded-full absolute left-[4.5px] top-[14px] shadow-sm z-30"></div>
                      
                      {/* Handle Left */}
                      <motion.div 
                        animate={isSnipping ? { rotate: [15, -2, 15] } : { rotate: 15 }}
                        transition={{ repeat: isSnipping ? Infinity : 0, duration: 0.3 }}
                        className="absolute top-[22px] -left-[20px] w-[24px] h-[36px] border-[5px] border-purple-500 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.4)] z-20 origin-top-right"
                      />
                      
                      {/* Handle Right */}
                      <motion.div 
                        animate={isSnipping ? { rotate: [-15, 2, -15] } : { rotate: -15 }}
                        transition={{ repeat: isSnipping ? Infinity : 0, duration: 0.3 }}
                        className="absolute top-[22px] left-[12px] w-[24px] h-[36px] border-[5px] border-purple-500 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.4)] z-20 origin-top-left"
                      />
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-[20px] font-bold text-white mb-3 text-center">Manage discounts and promotions</h2>
                <p className="text-[14px] text-[#888] mb-8 text-center max-w-[480px]">
                  Create discount codes and automatic discounts that apply at checkout. Increase conversions and reward loyal customers.
                </p>

                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl text-[14px] font-bold shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-colors"
                >
                  Create your first discount
                </motion.button>
              </motion.div>
            ) : (
              /* ── DISCOUNTS DATA TABLE ── */
              <motion.div 
                key="table"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col w-full h-full"
              >
                
                {/* Table Toolbar */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search codes..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-[280px] outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-[#888] hover:text-white">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar flex-1">
                  {filteredDiscounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Tag className="w-10 h-10 text-[#444] mb-4" />
                      <p className="text-[#888] text-[14px]">No discounts found matching your criteria.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#161616]">
                          {['Discount Code', 'Status', 'Type', 'Used', 'Start Date', 'Actions'].map((h, i) => (
                            <th key={i} className={`px-6 py-4 text-[12px] font-bold text-[#888] uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredDiscounts.map((discount) => (
                            <motion.tr 
                              key={discount.id}
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, x: -50, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              transition={{ duration: 0.2 }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                              <td className="px-6 py-4 text-[14px] font-bold text-white">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                  <span>{discount.code}</span>
                                  <button 
                                    onClick={() => copyToClipboard(discount.code)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#666] hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-all"
                                    title="Copy code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={() => toggleDiscountStatus(discount.id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-bold transition-colors border hover:shadow-md cursor-pointer ${
                                    discount.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                                    discount.status === 'Expired' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {discount.status === 'Active' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"/>}
                                  {discount.status}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-[13px] text-white font-medium">{discount.value}</div>
                                <div className="text-[11px] text-[#666]">{discount.type}</div>
                              </td>
                              <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">{discount.used} times</td>
                              <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">{discount.startDate}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => deleteDiscount(discount.id, discount.code)}
                                  className="p-2 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete Discount"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── MODAL: CREATE DISCOUNT ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161616]">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-purple-400" /> Create Discount
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleCreateDiscount} className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#888] mb-2 uppercase tracking-wider">Discount Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SUMMER2026" 
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 text-white text-[15px] font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 uppercase placeholder:normal-case placeholder:font-normal transition-colors"
                    required
                  />
                  <p className="text-[12px] text-[#666] mt-2">Customers will enter this code at checkout.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#888] mb-2 uppercase tracking-wider">Type</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as DiscountType)}
                      className="w-full bg-[#1a1a1a] border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                      <option value="Free Shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-[#888] mb-2 uppercase tracking-wider">Discount Value</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] font-bold">
                        {newType === 'Percentage' ? '%' : newType === 'Fixed Amount' ? '₹' : '🚚'}
                      </span>
                      <input 
                        type="number" 
                        placeholder={newType === 'Free Shipping' ? '0' : '20'}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        disabled={newType === 'Free Shipping'}
                        className="w-full bg-[#1a1a1a] border border-white/10 text-white text-[15px] font-bold rounded-xl pl-8 pr-4 py-3 outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        required={newType !== 'Free Shipping'}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-white hover:bg-white/10 transition-colors">Cancel</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-[14px] font-bold shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Discount
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}