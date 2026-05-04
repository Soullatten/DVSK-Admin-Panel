import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  CreditCard, 
  Mail, 
  MoreHorizontal,
  X,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { giftCardsApi } from '../api/marketingService';
import { useAdminDataRefresh } from '../lib/useAdminDataRefresh';

// ── Types & Demo Data ──
type CardStatus = 'Active' | 'Disabled' | 'Depleted';

interface GiftCardData {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  initialValue: number;
  currentBalance: number;
  issueDate: string;
  status: CardStatus;
}

const STATUS_FROM_API: Record<string, CardStatus> = {
  ACTIVE: 'Active', DISABLED: 'Disabled', DEPLETED: 'Depleted',
};
const STATUS_TO_API: Record<CardStatus, string> = {
  Active: 'ACTIVE', Disabled: 'DISABLED', Depleted: 'DEPLETED',
};

const apiToCard = (a: any): GiftCardData => ({
  id: a.id,
  code: a.code,
  customerName: a.customerName || 'Guest User',
  customerEmail: a.customerEmail || '',
  initialValue: Number(a.initialValue) || 0,
  currentBalance: Number(a.currentBalance) || 0,
  issueDate: a.createdAt
    ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—',
  status: STATUS_FROM_API[a.status] ?? 'Active',
});

export default function GiftCards() {
  const [cards, setCards] = useState<GiftCardData[]>([]);

  const refresh = async () => {
    try {
      const list = await giftCardsApi.list();
      setCards(list.map(apiToCard));
    } catch (err) {
      console.error('[GiftCards] failed to load', err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useAdminDataRefresh('gift-cards', refresh);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    value: '50',
    note: ''
  });

  const getStatusColor = (status: CardStatus) => {
    switch (status) {
      case 'Active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Depleted': return 'text-[#888] bg-white/5 border-white/10';
      case 'Disabled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Gift card code copied!');
  };

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerEmail || !formData.value) {
      toast.error('Email and Value are required');
      return;
    }
    const newValue = parseFloat(formData.value);
    try {
      const created = await giftCardsApi.create({
        customerName: formData.customerName || null,
        customerEmail: formData.customerEmail,
        value: newValue,
        note: formData.note || null,
      });
      setCards(prev => [apiToCard(created), ...prev]);
      setIsModalOpen(false);
      setFormData({ customerName: '', customerEmail: '', value: '50', note: '' });
      toast.success(`₹${newValue} Gift Card issued to ${formData.customerEmail}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to issue card');
    }
  };

  const toggleStatus = async (id: string, currentStatus: CardStatus) => {
    if (currentStatus === 'Depleted') return toast.error('Cannot reactivate a depleted card.');
    const newStatus: CardStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      const updated = await giftCardsApi.update(id, { status: STATUS_TO_API[newStatus] });
      setCards(prev => prev.map(c => (c.id === id ? apiToCard(updated) : c)));
      toast.success(`Card ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredCards = cards.filter(c => 
    c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  // Metrics
  const activeLiability = cards.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.currentBalance, 0);
  const totalIssued = cards.length;

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col h-[calc(100vh-60px)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Gift Cards</h1>
            <p className="text-[14px] text-[#888] mt-1">Manage issued gift cards and track liability balances.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast('Exporting CSV...', { icon: '📊' })}
            className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors"
          >
            Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Issue Gift Card
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-4 h-4" /> Active Liability
          </div>
          <div className="text-[28px] font-bold text-white">
            ${activeLiability.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2">
            <Gift className="w-4 h-4" /> Cards Issued
          </div>
          <div className="text-[28px] font-bold text-white">
            {totalIssued} <span className="text-[14px] text-[#666] font-medium">total cards</span>
          </div>
        </div>
        
        {/* Visual Gift Card Element */}
        <div className="bg-gradient-to-br from-teal-900 to-emerald-900 border border-teal-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(20,184,166,0.15)] flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="flex justify-between items-start relative z-10">
              <span className="text-[14px] font-bold text-teal-100 tracking-widest uppercase">Digital Card</span>
              <Gift className="w-5 h-5 text-teal-300" />
           </div>
           <div className="relative z-10 mt-6">
             <div className="text-[11px] text-teal-300/70 uppercase tracking-wider mb-1">Standard Issue Value</div>
             <div className="text-[24px] font-mono font-bold text-white tracking-widest">$50.00</div>
           </div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex-1 flex flex-col">
        <div className="p-5 border-b border-white/10 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <h2 className="text-[15px] font-semibold text-white">Issued Cards</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search customer or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-full sm:w-[250px] outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {filteredCards.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-[#888]">
               <Gift className="w-12 h-12 mb-4 opacity-30" />
               <p>No gift cards found.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#161616] z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Gift Card Code</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                           <Gift className="w-3.5 h-3.5 text-teal-400" />
                        </div>
                        <div>
                          <div className="text-[14px] font-mono font-bold text-white tracking-wider flex items-center gap-2">
                            {card.code}
                            <button onClick={() => copyToClipboard('1A2B-3C4D-5E6F-4921')} className="opacity-0 group-hover:opacity-100 text-[#666] hover:text-white transition-all"><Copy className="w-3 h-3" /></button>
                          </div>
                          <div className="text-[11px] text-[#888] mt-0.5">Issued: {card.issueDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[13px] font-semibold text-[#ececec]">{card.customerName}</div>
                      <div className="text-[11px] text-[#888]">{card.customerEmail}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-bold text-white">${card.currentBalance.toFixed(2)} <span className="text-[#666] text-[12px] font-normal ml-1">/ ${card.initialValue.toFixed(2)}</span></div>
                      {/* Simple progress bar for balance */}
                      <div className="w-[100px] h-1.5 bg-[#222] rounded-full mt-1.5 overflow-hidden">
                         <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(card.currentBalance / card.initialValue) * 100}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1.5 rounded-md border text-[11px] font-bold uppercase tracking-wider ${getStatusColor(card.status)}`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {card.status !== 'Depleted' && (
                          <button 
                            onClick={() => toggleStatus(card.id, card.status)}
                            className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-colors"
                          >
                            {card.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ISSUE CARD MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#161616]">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2"><Gift className="w-5 h-5 text-teal-400" /> Issue Gift Card</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleIssueCard} className="p-6 space-y-5">
                
                {/* Value Selector */}
                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Card Value</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['25', '50', '100', '200'].map(val => (
                      <button 
                        key={val} type="button"
                        onClick={() => setFormData({...formData, value: val})}
                        className={`py-2 rounded-xl text-[14px] font-bold border transition-all ${formData.value === val ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white hover:border-white/30'}`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] font-bold">$</span>
                    <input 
                      type="number" required min="1" step="1"
                      value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-[14px] text-white outline-none focus:border-teal-500/50" 
                    />
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/10" />

                {/* Recipient Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Recipient Name (Optional)</label>
                    <input 
                      type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-teal-500/50" placeholder="Jane Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Recipient Email *</label>
                    <input 
                      type="email" required value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-teal-500/50" placeholder="jane@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Personal Note (Optional)</label>
                    <textarea 
                      rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} 
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-teal-500/50 resize-none" placeholder="Happy Birthday!" 
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center gap-2 transition-all">
                    Issue & Email Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}