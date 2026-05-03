import React, { useState } from 'react';
import { 
  Users2, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  Filter, 
  PieChart, 
  TrendingUp,
  X,
  Mail,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Download,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types & Demo Data ──
interface SegmentItem {
  id: string;
  name: string;
  customerCount: number;
  totalCustomers: number;
  lastActivity: string;
  createdBy: string;
  isSystem: boolean;
  logicRule: string;
}

const TOTAL_STORE_CUSTOMERS = 1420;

const DEMO_SEGMENTS: SegmentItem[] = [
  { id: 'SEG-1', name: 'Purchased at least once', customerCount: 845, totalCustomers: TOTAL_STORE_CUSTOMERS, lastActivity: 'Updated 2 hrs ago', createdBy: 'System', isSystem: true, logicRule: 'Order Count > 0' },
  { id: 'SEG-2', name: 'Email subscribers', customerCount: 1120, totalCustomers: TOTAL_STORE_CUSTOMERS, lastActivity: 'Updated 5 hrs ago', createdBy: 'System', isSystem: true, logicRule: 'Accepts Marketing = True' },
  { id: 'SEG-3', name: 'Abandoned checkouts (30 days)', customerCount: 156, totalCustomers: TOTAL_STORE_CUSTOMERS, lastActivity: 'Updated 1 day ago', createdBy: 'System', isSystem: true, logicRule: 'Abandoned Cart = True AND Days < 30' },
  { id: 'SEG-4', name: 'VIPs (Spent > $500)', customerCount: 89, totalCustomers: TOTAL_STORE_CUSTOMERS, lastActivity: 'Updated 3 days ago', createdBy: 'Alex Admin', isSystem: false, logicRule: 'Total Spent > $500' },
];

const DEMO_CUSTOMERS_IN_SEGMENT = [
  { id: 'C1', name: 'Alex Carter', email: 'alex@example.com', spent: 1240.50, orders: 12 },
  { id: 'C2', name: 'Sarah Jenkins', email: 'sarah.j@example.com', spent: 650.00, orders: 5 },
  { id: 'C3', name: 'Mike Ross', email: 'mross@company.com', spent: 890.20, orders: 8 },
  { id: 'C4', name: 'Jessica Day', email: 'jess@lawfirm.com', spent: 510.00, orders: 3 },
  { id: 'C5', name: 'Harvey Specter', email: 'harvey@pearson.com', spent: 2200.00, orders: 15 },
];

export default function Segments() {
  const { data: liveData } = useMainWebsite('/segments');
  
  const [segments, setSegments] = useState<SegmentItem[]>(liveData && liveData.length > 0 ? liveData : DEMO_SEGMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [filterType, setFilterType] = useState('Total Spent ($)');
  const [filterCondition, setFilterCondition] = useState('>');
  const [filterValue, setFilterValue] = useState('');

  // Interactive States
  const [viewingSegment, setViewingSegment] = useState<SegmentItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Email Campaign State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' });

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ──

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName || !filterValue) return toast.error('Please fill out all rule fields.');
    const simulatedCount = Math.floor(Math.random() * 300) + 10;
    const newSeg: SegmentItem = {
      id: `SEG-${Math.floor(Math.random() * 900) + 100}`,
      name: newSegmentName,
      customerCount: simulatedCount,
      totalCustomers: TOTAL_STORE_CUSTOMERS,
      lastActivity: 'Just now',
      createdBy: 'Admin User',
      isSystem: false,
      logicRule: `${filterType} ${filterCondition} ${filterValue}`
    };
    setSegments([newSeg, ...segments]);
    setIsBuilderOpen(false);
    setNewSegmentName('');
    setFilterValue('');
    toast.success(`Segment built! Found ${simulatedCount} matching customers.`);
  };

  const deleteSegment = (id: string, isSystem: boolean) => {
    if (isSystem) return toast.error("System segments cannot be deleted.");
    setSegments(segments.filter(s => s.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    toast.success("Custom segment deleted.");
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSegments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSegments.map(s => s.id)));
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    let deletedCount = 0;
    let keptSystemCount = 0;
    const newSegments = segments.filter(s => {
      if (selectedIds.has(s.id)) {
        if (s.isSystem) {
          keptSystemCount++;
          return true; // Keep it
        }
        deletedCount++;
        return false; // Delete it
      }
      return true;
    });

    setSegments(newSegments);
    setSelectedIds(new Set());
    
    if (deletedCount > 0) toast.success(`Deleted ${deletedCount} custom segment(s).`);
    if (keptSystemCount > 0) toast.error(`Kept ${keptSystemCount} system segment(s).`);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailDraft.subject || !emailDraft.body) return toast.error('Please enter a subject and body.');
    setIsEmailModalOpen(false);
    setEmailDraft({ subject: '', body: '' });
    
    // Simulate sending email process
    toast.loading(`Preparing ${viewingSegment?.customerCount} emails...`, { duration: 1500 });
    setTimeout(() => {
      toast.success('Campaign sent successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col h-[calc(100vh-60px)] relative overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Users2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Customer Segments</h1>
            <p className="text-[14px] text-[#888] mt-1">Group and filter your audience for targeted marketing.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBuilderOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Build Segment
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><Users2 className="w-4 h-4" /> Total Audience</div>
          <div className="text-[28px] font-bold text-white">{TOTAL_STORE_CUSTOMERS.toLocaleString()} <span className="text-[14px] text-[#666] font-medium">profiles</span></div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><TrendingUp className="w-4 h-4" /> Buyers</div>
          <div className="text-[28px] font-bold text-white">59.5% <span className="text-[14px] text-[#666] font-medium">conversion rate</span></div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><PieChart className="w-4 h-4" /> Custom Segments</div>
          <div className="text-[28px] font-bold text-white">{segments.filter(s => !s.isSystem).length} <span className="text-[14px] text-[#666] font-medium">built</span></div>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex-1 flex flex-col">
        <div className="p-5 border-b border-white/10 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 h-[72px]">
          
          {/* BULK ACTIONS OR NORMAL HEADER */}
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-lg">{selectedIds.size} Selected</span>
              <button onClick={() => toast.success('Exporting to CSV...')} className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#888] hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : (
            <h2 className="text-[15px] font-semibold text-white">Saved Segments</h2>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search segment names..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-full sm:w-[250px] outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {filteredSegments.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-[#888]">
               <Filter className="w-12 h-12 mb-4 opacity-30" />
               <p>No segments match your search.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#161616] z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-10">
                     {/* Select All Checkbox */}
                     <input 
                       type="checkbox" 
                       checked={filteredSegments.length > 0 && selectedIds.size === filteredSegments.length}
                       onChange={toggleSelectAll}
                       className="rounded border-white/20 bg-transparent accent-indigo-500 cursor-pointer w-4 h-4" 
                     />
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Segment Name</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[250px]">Audience Size</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSegments.map((segment) => {
                  const percentage = ((segment.customerCount / segment.totalCustomers) * 100).toFixed(1);
                  const isSelected = selectedIds.has(segment.id);
                  return (
                    <tr key={segment.id} className={`hover:bg-white/[0.03] transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-500/5' : ''}`} onClick={() => setViewingSegment(segment)}>
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => toggleSelect(e as any, segment.id)}
                          className="rounded border-white/20 bg-transparent accent-indigo-500 cursor-pointer w-4 h-4" 
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="text-[14px] font-bold text-white">{segment.name}</div>
                          {segment.isSystem && <span className="bg-white/10 text-[#888] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">System</span>}
                        </div>
                        <div className="text-[11px] text-[#666] mt-1 flex items-center gap-1">Created by {segment.createdBy}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                          <span className="font-bold text-indigo-400">{segment.customerCount.toLocaleString()}</span>
                          <span className="text-[#888] font-mono">{percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[#888]">{segment.lastActivity}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setViewingSegment(segment); }} className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors">
                            View
                          </button>
                          {!segment.isSystem && (
                            <button onClick={(e) => { e.stopPropagation(); deleteSegment(segment.id, segment.isSystem); }} className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── VIEW SEGMENT SLIDE-OVER DRAWER ── */}
      <AnimatePresence>
        {viewingSegment && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingSegment(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[600px] bg-[#111] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 bg-[#161616] flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Filter className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h2 className="text-[20px] font-bold text-white">{viewingSegment.name}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-4 bg-[#1a1a1a] border border-white/10 px-3 py-2 rounded-lg w-fit">
                     <span className="text-[10px] uppercase font-bold tracking-wider text-[#666]">Logic Rule:</span>
                     <span className="text-[12px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">{viewingSegment.logicRule}</span>
                  </div>
                </div>
                <button onClick={() => setViewingSegment(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#888] hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 border-b border-white/10 shrink-0 bg-[#0a0a0a]">
                <div>
                  <div className="text-[11px] text-[#666] font-bold uppercase tracking-wider mb-1">Customers in Segment</div>
                  <div className="text-[24px] font-bold text-indigo-400">{viewingSegment.customerCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#666] font-bold uppercase tracking-wider mb-1">Marketing Status</div>
                  {/* ACTIVATED THIS BUTTON! */}
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="bg-indigo-600 text-white text-[12px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-2 mt-1 hover:bg-indigo-500 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                  >
                     <Mail className="w-3 h-3" /> Send Email Campaign
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <h3 className="text-[13px] font-bold text-white mb-4 uppercase tracking-wider">Preview (Showing top 5 of {viewingSegment.customerCount})</h3>
                <div className="space-y-3">
                  {DEMO_CUSTOMERS_IN_SEGMENT.map(cust => (
                    <div key={cust.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[12px]">
                          {cust.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-white">{cust.name}</div>
                          <div className="text-[11px] text-[#888]">{cust.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-bold text-emerald-400">${cust.spent.toFixed(2)}</div>
                        <div className="text-[11px] text-[#666] flex items-center justify-end gap-1"><ShoppingBag className="w-3 h-3"/> {cust.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* ACTIVATED THIS BUTTON! */}
                <button 
                  onClick={() => {
                    toast.loading(`Fetching remaining ${viewingSegment.customerCount - 5} records...`);
                    setTimeout(() => toast.success("All customers loaded!"), 1500);
                  }}
                  className="w-full mt-6 py-3 border border-white/10 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5 transition-colors"
                >
                   View all {viewingSegment.customerCount} customers
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── BUILD SEGMENT MODAL ── */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#161616]">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-400" /> Build New Segment</h2>
                <button onClick={() => setIsBuilderOpen(false)} className="text-[#888] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateSegment} className="p-6 space-y-6">
                <div><label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Segment Name</label><input type="text" required value={newSegmentName} onChange={e => setNewSegmentName(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-indigo-500/50" placeholder="e.g. High Value NY Customers" /></div>
                <div className="h-[1px] w-full bg-white/10" />
                <div>
                  <label className="block text-[12px] font-bold text-indigo-400 mb-3 uppercase tracking-wider">Condition Rules</label>
                  <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 p-2 rounded-xl">
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-[13px] font-bold text-white outline-none cursor-pointer pl-2 pr-4 border-r border-white/10">
                      <option value="Total Spent ($)" className="bg-[#111]">Total Spent ($)</option>
                      <option value="Order Count" className="bg-[#111]">Order Count</option>
                    </select>
                    <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className="bg-transparent text-[13px] font-bold text-indigo-300 outline-none cursor-pointer px-2 border-r border-white/10">
                      <option value=">" className="bg-[#111]">Greater than</option>
                      <option value="<" className="bg-[#111]">Less than</option>
                      <option value="=" className="bg-[#111]">Exactly</option>
                    </select>
                    <input type="number" required value={filterValue} onChange={e => setFilterValue(e.target.value)} className="w-full bg-transparent text-[14px] text-white outline-none px-2" placeholder="e.g. 500" />
                  </div>
                </div>
                <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-6">
                  <div className="flex gap-3 ml-auto">
                    <button type="button" onClick={() => setIsBuilderOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-2 transition-all">Build Segment</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EMAIL CAMPAIGN MODAL ── */}
      <AnimatePresence>
        {isEmailModalOpen && viewingSegment && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 bg-[#161616] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><Mail className="w-4 h-4 text-indigo-400" /></div>
                  <h2 className="text-[16px] font-bold text-white">Draft Campaign</h2>
                </div>
                <button onClick={() => setIsEmailModalOpen(false)} className="text-[#888] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#888]">To: <span className="text-white ml-2">{viewingSegment.name}</span></span>
                  <span className="text-[12px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{viewingSegment.customerCount} recipients</span>
                </div>
                
                <div>
                  <input type="text" required value={emailDraft.subject} onChange={e => setEmailDraft({...emailDraft, subject: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-indigo-500/50 font-bold" placeholder="Subject Line" />
                </div>
                
                <div>
                  <textarea required rows={5} value={emailDraft.body} onChange={e => setEmailDraft({...emailDraft, body: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-indigo-500/50 resize-none" placeholder="Write your message here. Use {{first_name}} to personalize." />
                </div>
                
                <div className="pt-2 flex justify-end gap-3 border-t border-white/10 mt-4">
                  <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-2">
                    <Send className="w-4 h-4" /> Send Now
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
      `}} />
    </div>
  );
}