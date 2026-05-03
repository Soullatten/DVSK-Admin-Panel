import React, { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  Globe, 
  ShoppingBag, 
  Search, 
  MoreHorizontal, 
  Eye,
  Clock,
  MapPin,
  UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMainWebsite } from "../hooks/useMainWebsite";

// ── Types & Demo Data ──
interface Customer {
  id: string;
  name: string;
  email: string;
  orders_count: number;
  total_spent: number;
  isOnline: boolean;
  lastLogin: string;
  avatarColor: string;
}

interface LiveSession {
  id: string;
  isGuest: boolean;
  customerName?: string;
  location: string;
  currentPage: string;
  timeActive: string;
}

const DEMO_CUSTOMERS: Customer[] = [
  { id: 'CUS-001', name: 'Alex Carter', email: 'alex@example.com', orders_count: 12, total_spent: 1240.50, isOnline: true, lastLogin: 'Right now', avatarColor: 'bg-blue-500' },
  { id: 'CUS-002', name: 'Sarah Jenkins', email: 'sarah.j@example.com', orders_count: 3, total_spent: 345.00, isOnline: false, lastLogin: '2 hours ago', avatarColor: 'bg-purple-500' },
  { id: 'CUS-003', name: 'Mike Ross', email: 'mross@company.com', orders_count: 8, total_spent: 890.20, isOnline: true, lastLogin: 'Right now', avatarColor: 'bg-emerald-500' },
  { id: 'CUS-004', name: 'Emily Chen', email: 'emily.chen@email.com', orders_count: 1, total_spent: 120.00, isOnline: false, lastLogin: '1 day ago', avatarColor: 'bg-amber-500' },
  { id: 'CUS-005', name: 'David Kim', email: 'dkim@startup.io', orders_count: 0, total_spent: 0.00, isOnline: false, lastLogin: '3 days ago', avatarColor: 'bg-rose-500' },
];

const INITIAL_SESSIONS: LiveSession[] = [
  { id: 'SESS-1', isGuest: false, customerName: 'Alex Carter', location: 'Chicago, US', currentPage: '/products/heavyweight-hoodie', timeActive: '12m' },
  { id: 'SESS-2', isGuest: true, location: 'Mumbai, IN', currentPage: '/checkout', timeActive: '4m' },
  { id: 'SESS-3', isGuest: false, customerName: 'Mike Ross', location: 'New York, US', currentPage: '/account/orders', timeActive: '28m' },
  { id: 'SESS-4', isGuest: true, location: 'London, UK', currentPage: '/', timeActive: '1m' },
];

const PAGES_TO_SIMULATE = ['/', '/products/heavyweight-hoodie', '/products/summer-cap', '/cart', '/checkout', '/collections/new-arrivals'];

export default function Customers() {
  const { data: liveData, loading, error, viewOnMainWebsite } = useMainWebsite<any>("/customers");
  
  // Use real data if available, otherwise fallback to rich demo data
  const [customers, setCustomers] = useState<Customer[]>(liveData && liveData.length > 0 ? liveData : DEMO_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Sessions State
  const [sessions, setSessions] = useState<LiveSession[]>(INITIAL_SESSIONS);

  // Simulate real-time website traffic!
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(currentSessions => {
        const newSessions = [...currentSessions];
        // Randomly pick a session to "click" to a new page
        const randomSessionIndex = Math.floor(Math.random() * newSessions.length);
        const randomPage = PAGES_TO_SIMULATE[Math.floor(Math.random() * PAGES_TO_SIMULATE.length)];
        
        newSessions[randomSessionIndex] = {
          ...newSessions[randomSessionIndex],
          currentPage: randomPage
        };
        return newSessions;
      });
    }, 4000); // Updates someone's page every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-60px)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Customers & Live Traffic</h1>
            <p className="text-[14px] text-[#888] mt-1">Manage your registered users and monitor real-time website activity.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => viewOnMainWebsite("/account")}
            className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> View Live Login Page
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-[#111111] border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" /> Live Visitors
            <span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-[28px] font-bold text-white">{sessions.length} <span className="text-[14px] text-[#888] font-medium">on site right now</span></div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><ShoppingBag className="w-4 h-4" /> Active Carts</div>
          <div className="text-[28px] font-bold text-white">{sessions.filter(s => s.currentPage === '/cart' || s.currentPage === '/checkout').length}</div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><Users className="w-4 h-4" /> Registered Users</div>
          <div className="text-[28px] font-bold text-white">{customers.length}</div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><UserCircle className="w-4 h-4" /> Users Online</div>
          <div className="text-[28px] font-bold text-white">{customers.filter(c => c.isOnline).length}</div>
        </div>
      </div>

      {/* ── MAIN LAYOUT (SPLIT VIEW) ── */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: CUSTOMER DATABASE TABLE */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex-1 flex flex-col w-full lg:w-2/3">
          <div className="p-5 border-b border-white/10 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <h2 className="text-[15px] font-semibold text-white">Customer Database</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-full sm:w-[250px] outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#161616] z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${cust.avatarColor} flex items-center justify-center text-white font-bold text-[14px] shadow-lg`}>
                          {cust.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-white">{cust.name}</div>
                          <div className="text-[12px] text-[#888]">{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {cust.isOnline ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Online Now</span>
                        </div>
                      ) : (
                        <div className="text-[12px] text-[#666] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {cust.lastLogin}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-semibold text-white">{cust.orders_count}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-mono font-bold text-white">${cust.total_spent.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-[#888] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: LIVE ACTIVITY FEED */}
        <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col w-full lg:w-1/3 shrink-0">
          <div className="p-5 border-b border-white/10 bg-[#161616] flex items-center gap-2">
             <Activity className="w-4 h-4 text-emerald-400" />
             <h2 className="text-[15px] font-semibold text-white">Live Activity Feed</h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div 
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden"
                >
                  {/* Flashing border effect when page changes */}
                  <motion.div 
                    key={session.currentPage}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl pointer-events-none"
                  />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {session.isGuest ? (
                        <div className="w-7 h-7 rounded-full bg-[#222] border border-white/10 flex items-center justify-center">
                          <Globe className="w-3.5 h-3.5 text-[#888]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">
                          {session.customerName?.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <div className="text-[13px] font-bold text-white">{session.isGuest ? 'Anonymous Guest' : session.customerName}</div>
                        <div className="text-[11px] text-[#666] flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.location}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">
                      {session.timeActive}
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-2.5 border border-white/5 flex items-start gap-2">
                    <Eye className="w-3.5 h-3.5 text-[#888] mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider mb-0.5">Viewing Page</span>
                      <span className="text-[12px] font-mono text-emerald-300 break-all leading-tight">{session.currentPage}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}