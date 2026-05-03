import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Bot, 
  Loader2, 
  MoreHorizontal,
  X,
  Check,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types ──
type EmailStatus = 'Sent' | 'Not sent' | 'Scheduled' | 'AI Processing';
type RecoveryStatus = 'Recovered' | 'Not recovered';

interface CheckoutOrder {
  id: string;
  date: string;
  customer: string;
  emailStatus: EmailStatus;
  recoveryStatus: RecoveryStatus;
  total: string;
}

// Fallback Data
const demoCheckouts: CheckoutOrder[] = [
  { id: '#1103239', date: 'Today at 3:45 PM', customer: 'michael.j@example.com', emailStatus: 'Scheduled', recoveryStatus: 'Not recovered', total: '₹5,200.00' },
  { id: '#1103238', date: 'Today at 1:12 PM', customer: 'sarah.smith@example.com', emailStatus: 'Sent', recoveryStatus: 'Recovered', total: '₹1,850.00' },
  { id: '#1103237', date: 'Yesterday at 8:20 AM', customer: 'unknown (Guest)', emailStatus: 'Not sent', recoveryStatus: 'Not recovered', total: '₹800.00' },
  { id: '#1103236', date: 'Oct 14 at 6:40 PM', customer: 'alex.w@example.com', emailStatus: 'Sent', recoveryStatus: 'Not recovered', total: '₹12,400.00' },
];

export default function AbandonedCheckouts() {
  // ── State Management ──
  const [searchQuery, setSearchQuery] = useState('');
  const [localCheckouts, setLocalCheckouts] = useState<CheckoutOrder[]>([]);
  
  // Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | EmailStatus>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  // Real backend connection
  const { data: liveData, loading: liveLoading, error: liveError } = useMainWebsite('/abandonedcheckouts');

  // ── Data Transformation Layer ──
  useEffect(() => {
    if (liveData && Array.isArray(liveData) && liveData.length > 0) {
      const mapped = liveData.map((item: any) => ({
        id: item.id || item.checkoutNumber || `#110${Math.floor(Math.random() * 9000)}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date',
        customer: item.User?.email || item.email || 'unknown (Guest)',
        emailStatus: item.emailStatus || 'Not sent',
        recoveryStatus: item.recoveryStatus || 'Not recovered',
        total: item.total ? `₹${Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00',
      }));
      setLocalCheckouts(mapped);
    } else {
      setLocalCheckouts(demoCheckouts);
    }
  }, [liveData]);

  // Handle clicking outside filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── AI Integration Handler ──
  const handleTriggerAIRecovery = async (id: string, customer: string) => {
    // 1. Immediately update UI to show the AI has taken over
    setLocalCheckouts(prev => 
      prev.map(c => c.id === id ? { ...c, emailStatus: 'AI Processing' } : c)
    );
    
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111111] border border-purple-500/30 shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-[14px] font-bold text-white">AI Agent Initiated</p>
              <p className="mt-1 text-[13px] text-[#888]">Generating personalized recovery sequence for {customer}...</p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 4000 });

    // 2. FUTURE BACKEND CONNECTION:
    // Here is where you will send the POST request to your backend/AI agent.
    /*
      try {
        await fetch('/api/ai/trigger-recovery', {
          method: 'POST',
          body: JSON.stringify({ checkoutId: id, email: customer })
        });
      } catch (e) {
        // Handle error and revert status
      }
    */

    // 3. For the demo, we simulate the AI successfully scheduling the sequence after 2 seconds
    setTimeout(() => {
      setLocalCheckouts(prev => 
        prev.map(c => c.id === id ? { ...c, emailStatus: 'Scheduled' } : c)
      );
      toast.success(`Sequence scheduled for ${customer}`);
    }, 2500);
  };

  // ── Derived Data (Search & Filter) ──
  const filteredCheckouts = localCheckouts.filter(checkout => {
    const matchesSearch = `${checkout.customer} ${checkout.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || checkout.emailStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (liveError) console.error("Backend Error:", liveError);

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1200px] mx-auto text-[#ececec]">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Abandoned checkouts</h1>
            <p className="text-[14px] text-[#888] mt-1">Automate recovery sequences using AI.</p>
          </div>
        </div>
        <button 
          onClick={() => toast.success('Bulk AI Recovery started for all open checkouts!')}  
          className="bg-[#1a1a1a] border border-white/10 hover:border-purple-500/50 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-all shadow-sm flex items-center gap-2 group"
        >
          <Bot className="w-4 h-4 text-[#888] group-hover:text-purple-400 transition-colors" /> Auto-Recover All
        </button>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-visible">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/10 gap-4">
          
          {/* Search Bar */}
          <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full sm:max-w-[400px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
            <Search className="w-4 h-4 text-[#888] mr-2.5" />
            <input
              type="text"
              placeholder="Search by email or checkout ID..."
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

          {/* Filter Dropdown */}
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
                <div className="px-3 py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wider border-b border-white/5 mb-1">Email Status</div>
                {(['All', 'Sent', 'Not sent', 'Scheduled', 'AI Processing'] as const).map((filterOption) => (
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
              <span className="text-[13px] text-[#888] font-medium">Loading checkouts...</span>
            </div>
          ) : filteredCheckouts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-[#666]" />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">No abandoned checkouts</h3>
              <p className="text-[14px] text-[#888] max-w-[250px]">
                {activeFilter !== 'All' ? `No checkouts match the status "${activeFilter}".` : "You currently have no abandoned checkouts."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10">
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20 accent-purple-500 w-4 h-4 cursor-pointer" /></th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Checkout</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Placed By</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Email Status</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Recovery</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCheckouts.map((checkout) => (
                  <tr key={checkout.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    
                    <td className="px-6 py-4"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20 accent-purple-500 w-4 h-4 cursor-pointer" /></td>
                    
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-white hover:text-purple-400 transition-colors">
                        {checkout.id}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-[14px] text-[#a0a0a0] font-medium">{checkout.date}</td>
                    
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-medium text-[#ececec]">{checkout.customer}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {checkout.emailStatus === 'Sent' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Sent
                        </div>
                      )}
                      {checkout.emailStatus === 'Scheduled' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" /> Scheduled
                        </div>
                      )}
                      {checkout.emailStatus === 'AI Processing' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[12px] font-semibold">
                          <Loader2 className="w-3 h-3 animate-spin" /> AI Generating
                        </div>
                      )}
                      {checkout.emailStatus === 'Not sent' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#ececec] text-[12px] font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#888]" /> Not Sent
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {checkout.recoveryStatus === 'Recovered' ? (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold">
                          Recovered
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#888] text-[12px] font-semibold">
                          Not recovered
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-[14px] font-semibold text-white text-right">{checkout.total}</td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {checkout.emailStatus === 'Not sent' && checkout.recoveryStatus !== 'Recovered' && checkout.customer !== 'unknown (Guest)' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTriggerAIRecovery(checkout.id, checkout.customer); }} 
                            className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-md transition-colors flex items-center gap-1" 
                            title="Trigger AI Agent"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-white/10 text-[#888] hover:text-white rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
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

    </div>
  );
}