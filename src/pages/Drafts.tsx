import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Plus, 
  Loader2, 
  MoreHorizontal,
  Trash2,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types ──
type DraftStatus = 'Open' | 'Invoice sent' | 'Completed';

interface DraftOrder {
  id: string;
  date: string;
  customer: string;
  status: DraftStatus;
  total: string;
}

// Initial State Data
const initialDrafts: DraftOrder[] = [
  { id: '#D1029', date: 'Today at 2:15 PM', customer: 'Alice Cooper', status: 'Open', total: '₹1,200.00' },
  { id: '#D1028', date: 'Today at 11:30 AM', customer: 'Robert Fox', status: 'Invoice sent', total: '₹8,500.00' },
  { id: '#D1027', date: 'Yesterday at 4:20 PM', customer: 'Emma Watson', status: 'Completed', total: '₹3,400.00' },
  { id: '#D1026', date: 'Oct 14 at 9:00 AM', customer: 'David Miller', status: 'Open', total: '₹450.00' },
];

export default function Drafts() {
  // ── State Management ──
  const [drafts, setDrafts] = useState<DraftOrder[]>(initialDrafts);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | DraftStatus>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  // Create Draft Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDraft, setNewDraft] = useState({ 
    customer: '', 
    total: '',
    status: 'Open' as DraftStatus 
  });
  
  // Custom Select Dropdown State inside Modal
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);

  // Real backend connection hook
  const { data: liveData, loading: liveLoading } = useMainWebsite('/drafts');

  // Sync live data if available
  useEffect(() => {
    if (liveData && Array.isArray(liveData) && liveData.length > 0) {
      const mapped = liveData.map((item: any) => ({
        id: item.id || item.draftNumber || `#D${Math.floor(Math.random() * 9000) + 1000}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now',
        customer: item.User?.name || item.customerName || 'Guest',
        status: item.status || 'Open',
        total: item.total ? `₹${Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
      }));
      setDrafts(mapped);
    }
  }, [liveData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ──
  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraft.customer || !newDraft.total) {
      toast.error('Please fill all fields');
      return;
    }

    const createdDraft: DraftOrder = {
      id: `#D${Math.floor(Math.random() * 9000) + 1000}`,
      date: 'Just now',
      customer: newDraft.customer,
      status: newDraft.status,
      total: `₹${Number(newDraft.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    };

    setDrafts([createdDraft, ...drafts]);
    setIsCreateModalOpen(false);
    setNewDraft({ customer: '', total: '', status: 'Open' });
    setIsStatusSelectOpen(false);
    toast.success('Draft created successfully!');
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    toast.success('Draft deleted');
  };

  const handleSendInvoice = (id: string, customer: string) => {
    setDrafts(drafts.map(d => d.id === id ? { ...d, status: 'Invoice sent' } : d));
    toast.success(`Invoice sent to ${customer}`);
  };

  // ── Derived Data (Search & Filter) ──
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = `${draft.customer} ${draft.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || draft.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1200px] mx-auto text-[#ececec]">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Drafts</h1>
          <p className="text-[14px] text-[#888] mt-1">Manage incomplete orders and send invoices.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}  
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create draft
        </button>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-visible">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/10 gap-4">
          
          {/* Working Search Bar */}
          <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full sm:max-w-[400px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
            <Search className="w-4 h-4 text-[#888] mr-2.5" />
            <input
              type="text"
              placeholder="Search drafts by customer or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#666]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#666] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Working Filter Dropdown */}
          <div className="relative flex items-center gap-3 w-full sm:w-auto" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium rounded-xl transition-colors border ${activeFilter !== 'All' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-[#1a1a1a] border-white/10 text-[#ececec] hover:bg-white/5'}`}
            >
              <Filter className="w-4 h-4" /> 
              {activeFilter !== 'All' ? activeFilter : 'Filters'}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-[110%] w-[180px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                <div className="px-3 py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wider border-b border-white/5 mb-1">Filter by Status</div>
                {(['All', 'Open', 'Invoice sent', 'Completed'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => { setActiveFilter(filterOption); setIsFilterOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                  >
                    {filterOption}
                    {activeFilter === filterOption && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {liveLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              <span className="text-[13px] text-[#888] font-medium">Loading drafts...</span>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#666]" />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">No drafts found</h3>
              <p className="text-[14px] text-[#888] max-w-[250px]">
                {activeFilter !== 'All' ? `You have no ${activeFilter.toLowerCase()} drafts.` : "Adjust your search or filters to find what you're looking for."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10">
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20 accent-purple-500 w-4 h-4 cursor-pointer" /></th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Draft</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider w-[100px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20 accent-purple-500 w-4 h-4 cursor-pointer" /></td>
                    <td className="px-6 py-4"><span className="text-[14px] font-bold text-white hover:text-purple-400 transition-colors">{draft.id}</span></td>
                    <td className="px-6 py-4 text-[14px] text-[#a0a0a0] font-medium">{draft.date}</td>
                    <td className="px-6 py-4"><div className="text-[14px] font-medium text-[#ececec]">{draft.customer}</div></td>
                    <td className="px-6 py-4">
                      {draft.status === 'Completed' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Completed
                        </div>
                      )}
                      {draft.status === 'Invoice sent' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" /> Invoice Sent
                        </div>
                      )}
                      {draft.status === 'Open' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#ececec] text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#888]" /> Open
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] font-semibold text-white text-right">{draft.total}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {draft.status === 'Open' && (
                          <button onClick={(e) => { e.stopPropagation(); handleSendInvoice(draft.id, draft.customer); }} className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-md transition-colors" title="Send Invoice">
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Delete Draft">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── CREATE DRAFT MODAL ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-[16px] font-bold text-white">Create New Draft</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDraft} className="p-5 space-y-5">
              
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Customer Name</label>
                <input 
                  type="text" 
                  value={newDraft.customer}
                  onChange={(e) => setNewDraft({...newDraft, customer: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="e.g. John Doe"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Total Amount (₹)</label>
                <input 
                  type="number" 
                  value={newDraft.total}
                  onChange={(e) => setNewDraft({...newDraft, total: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="0.00"
                />
              </div>
              
              {/* Custom Status Dropdown */}
              <div className="relative">
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Initial Status</label>
                
                <button 
                  type="button"
                  onClick={() => setIsStatusSelectOpen(!isStatusSelectOpen)}
                  className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    {newDraft.status === 'Completed' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                    {newDraft.status === 'Invoice sent' && <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
                    {newDraft.status === 'Open' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
                    {newDraft.status}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#888]" />
                </button>

                {isStatusSelectOpen && (
                  <div className="absolute left-0 right-0 top-[105%] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                    {(['Open', 'Invoice sent', 'Completed'] as DraftStatus[]).map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => { 
                          setNewDraft({...newDraft, status: statusOption}); 
                          setIsStatusSelectOpen(false); 
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {statusOption === 'Completed' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                          {statusOption === 'Invoice sent' && <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />}
                          {statusOption === 'Open' && <div className="w-2 h-2 rounded-full bg-[#888]" />}
                          {statusOption}
                        </div>
                        {newDraft.status === statusOption && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#ececec] hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}