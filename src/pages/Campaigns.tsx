import React, { useState } from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  X, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Play,
  Pause,
  Mail,
  Globe,
  ArrowRight,
  Trash2,
  Target,
  Ghost,
  MessageSquare,
  Camera,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── CUSTOM BRAND ICONS (To guarantee no import errors) ──
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3"/></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 7.1C2.6 5.3 4.1 3.9 6 3.8 8 3.7 12 3.7 12 3.7s4 0 6 .1c1.9.1 3.4 1.5 3.5 3.3.1 1.6.1 3.3.1 4.9s0 3.3-.1 4.9c-.1 1.8-1.6 3.2-3.5 3.3-2 .1-6 .1-6 .1s-4 0-6-.1c-1.9-.1-3.4-1.5-3.5-3.3C2.4 15.3 2.4 13.6 2.4 12s0-3.3.1-4.9z"/><path d="M9.8 15.5l5.5-3.5-5.5-3.5v7z"/></svg>
);

// ── Types & Demo Data ──
type Platform = 'Instagram Ads' | 'Facebook Ads' | 'TikTok Ads' | 'Google Ads' | 'YouTube Ads' | 'Snapchat Ads' | 'Pinterest Ads' | 'LinkedIn Ads' | 'Email' | 'SMS';

const PLATFORMS: Platform[] = ['Instagram Ads', 'Facebook Ads', 'TikTok Ads', 'Google Ads', 'YouTube Ads', 'Snapchat Ads', 'Pinterest Ads', 'LinkedIn Ads', 'Email', 'SMS'];

interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  status: 'Active' | 'Paused' | 'Draft';
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
}

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: 'CMP-1', name: 'Summer Essentials Drop', platform: 'Instagram Ads', status: 'Active', spend: 1250, revenue: 5420, clicks: 3420, conversions: 112 },
  { id: 'CMP-2', name: 'Retargeting - Cart Abandoners', platform: 'Email', status: 'Active', spend: 0, revenue: 2140, clicks: 850, conversions: 45 },
  { id: 'CMP-3', name: 'UGC Viral Push', platform: 'TikTok Ads', status: 'Paused', spend: 800, revenue: 1100, clicks: 5200, conversions: 28 },
  { id: 'CMP-4', name: 'Search Brand Terms', platform: 'Google Ads', status: 'Active', spend: 320, revenue: 2890, clicks: 1120, conversions: 64 },
  { id: 'CMP-5', name: 'Lookalike Audience (1%)', platform: 'Facebook Ads', status: 'Active', spend: 650, revenue: 1850, clicks: 2100, conversions: 38 },
  { id: 'CMP-6', name: 'Vlog Sponsorship Pre-roll', platform: 'YouTube Ads', status: 'Active', spend: 1500, revenue: 3200, clicks: 1400, conversions: 75 },
];

const PLATFORM_ICONS: Record<Platform, { icon: React.ReactNode, color: string }> = {
  'Instagram Ads': { icon: <InstagramIcon className="w-4 h-4" />, color: 'text-pink-500' },
  'Facebook Ads': { icon: <FacebookIcon className="w-4 h-4" />, color: 'text-blue-500' },
  'TikTok Ads': { icon: <TikTokIcon className="w-4 h-4" />, color: 'text-white' },
  'Google Ads': { icon: <Search className="w-4 h-4" />, color: 'text-emerald-400' },
  'YouTube Ads': { icon: <YoutubeIcon className="w-4 h-4" />, color: 'text-red-500' },
  'Snapchat Ads': { icon: <Ghost className="w-4 h-4" />, color: 'text-yellow-400' },
  'Pinterest Ads': { icon: <Camera className="w-4 h-4" />, color: 'text-rose-500' },
  'LinkedIn Ads': { icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-400' },
  'Email': { icon: <Mail className="w-4 h-4" />, color: 'text-purple-400' },
  'SMS': { icon: <MessageSquare className="w-4 h-4" />, color: 'text-green-400' },
};

export default function Campaigns() {
  const { data: liveData } = useMainWebsite('/campaigns');
  
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState<Platform | 'All'>('All');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [newCampaign, setNewCampaign] = useState<{ name: string; platform: Platform; budget: string }>({
    name: '',
    platform: 'Instagram Ads',
    budget: ''
  });

  // ── Derived KPIs (Recalculates based on Filter) ──
  const displayedCampaigns = campaigns
    .filter(c => activePlatformFilter === 'All' || c.platform === activePlatformFilter)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalSpend = displayedCampaigns.reduce((acc, curr) => acc + curr.spend, 0);
  const totalRevenue = displayedCampaigns.reduce((acc, curr) => acc + curr.revenue, 0);
  const averageRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : (totalRevenue > 0 ? '∞' : '0.00');

  // ── Handlers ──

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return toast.error('Please enter a campaign name.');

    const campaign: Campaign = {
      id: `CMP-${Math.floor(Math.random() * 900) + 100}`,
      name: newCampaign.name,
      platform: newCampaign.platform,
      status: 'Draft',
      spend: 0,
      revenue: 0,
      clicks: 0,
      conversions: 0
    };

    setCampaigns([campaign, ...campaigns]);
    setIsCreateModalOpen(false);
    setNewCampaign({ name: '', platform: 'Instagram Ads', budget: '' });
    toast.success('Campaign created successfully! Ready to launch.');
  };

  const toggleCampaignStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        toast.success(`${c.name} is now ${newStatus}.`);
        return { ...c, status: newStatus };
      }
      return c;
    }));
    
    if (viewingCampaign?.id === id) {
      setViewingCampaign({ ...viewingCampaign, status: viewingCampaign.status === 'Active' ? 'Paused' : 'Active' });
    }
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    setViewingCampaign(null);
    toast.success('Campaign deleted.');
  };

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-60px)] relative overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Marketing Campaigns</h1>
            <p className="text-[14px] text-[#888] mt-1">See exactly where your money is going and track ROAS.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      </div>

      {/* ── PLATFORM FILTER BAR ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto custom-scrollbar pb-2 shrink-0">
        <button
          onClick={() => setActivePlatformFilter('All')}
          className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all flex items-center gap-2 ${
            activePlatformFilter === 'All' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" /> All Platforms
        </button>
        
        {PLATFORMS.map(platform => (
          <button
            key={platform}
            onClick={() => setActivePlatformFilter(platform)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all flex items-center gap-2 ${
              activePlatformFilter === platform ? `bg-white/10 border-white/30 text-white shadow-lg` : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={PLATFORM_ICONS[platform].color}>{PLATFORM_ICONS[platform].icon}</span>
            {platform.replace(' Ads', '')}
          </button>
        ))}
      </div>

      {/* ── KPI DASHBOARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl transition-all" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider"><DollarSign className="w-4 h-4" /> Total Ad Spend</div>
            {activePlatformFilter !== 'All' && <span className={`p-1 rounded-md bg-[#1a1a1a] ${PLATFORM_ICONS[activePlatformFilter].color}`}>{PLATFORM_ICONS[activePlatformFilter].icon}</span>}
          </div>
          <div className="text-[28px] font-bold text-white">${totalSpend.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-all" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider"><TrendingUp className="w-4 h-4" /> Attributed Revenue</div>
          </div>
          <div className="text-[28px] font-bold text-emerald-400">${totalRevenue.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl transition-all" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider"><BarChart3 className="w-4 h-4" /> Average ROAS</div>
          </div>
          <div className="text-[28px] font-bold text-white">{averageRoas}x <span className="text-[14px] text-[#666] font-medium">return</span></div>
        </div>
      </div>

      {/* ── CAMPAIGN TABLE ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="p-5 border-b border-white/10 bg-[#161616] flex items-center justify-between shrink-0">
          <h2 className="text-[15px] font-semibold text-white">
            {activePlatformFilter === 'All' ? 'All Active Campaigns' : `${activePlatformFilter} Campaigns`}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-[250px] outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {displayedCampaigns.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-[#888]">
               <Megaphone className="w-12 h-12 mb-4 opacity-30" />
               <p>No campaigns found for {activePlatformFilter}.</p>
               {activePlatformFilter !== 'All' && (
                 <button onClick={() => setActivePlatformFilter('All')} className="mt-4 text-purple-400 hover:text-purple-300 text-[13px] font-bold underline">View All Platforms</button>
               )}
             </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#161616] z-10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Campaign Name</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Spend</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">ROAS</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedCampaigns.map((camp) => {
                  const roas = camp.spend > 0 ? (camp.revenue / camp.spend).toFixed(2) : (camp.revenue > 0 ? '∞' : '0.00');
                  const roasNum = parseFloat(roas);
                  
                  return (
                    <tr key={camp.id} onClick={() => setViewingCampaign(camp)} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-[#1a1a1a] border border-white/10 flex items-center justify-center ${PLATFORM_ICONS[camp.platform].color}`}>
                            {PLATFORM_ICONS[camp.platform].icon}
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-white">{camp.name}</div>
                            <div className="text-[11px] text-[#888]">{camp.platform}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          camp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          camp.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-[#222] text-[#888] border-white/10'
                        }`}>
                          {camp.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[13px] text-white font-medium">${camp.spend.toLocaleString()}</td>
                      <td className="px-6 py-5 text-[13px] text-white font-bold">${camp.revenue.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[13px] font-bold ${roasNum >= 2 || roas === '∞' ? 'text-emerald-400' : roasNum >= 1 ? 'text-yellow-400' : 'text-rose-400'}`}>
                          {roas}x
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => toggleCampaignStatus(e, camp.id)} 
                            className="bg-[#1a1a1a] border border-white/10 hover:bg-white/10 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                            title={camp.status === 'Active' ? "Pause Campaign" : "Resume Campaign"}
                          >
                            {camp.status === 'Active' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                          </button>
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

      {/* ── MODAL: CREATE CAMPAIGN ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161616] shrink-0">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2"><Megaphone className="w-5 h-5 text-purple-400" /> New Campaign</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[#888] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleCreateCampaign} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Campaign Name</label>
                  <input type="text" required value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="e.g. Winter Sale Retargeting" />
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Select Ad Platform</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PLATFORMS.map(platform => (
                      <button 
                        key={platform} type="button" 
                        onClick={() => setNewCampaign({...newCampaign, platform})} 
                        className={`py-3 px-3 rounded-xl text-[12px] font-bold border transition-all flex flex-col items-center justify-center gap-2 
                          ${newCampaign.platform === platform ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.15)]' : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white hover:bg-white/5'}`}
                      >
                        <span className={PLATFORM_ICONS[platform].color}>{PLATFORM_ICONS[platform].icon}</span>
                        <span className="text-center">{platform.replace(' Ads', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Daily Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input type="number" value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="50" />
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-white/10 bg-[#161616] flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5">Cancel</button>
                <button onClick={handleCreateCampaign} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(147,51,234,0.25)] flex items-center gap-2">
                  Create Draft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWER: VIEW CAMPAIGN DETAILS ── */}
      <AnimatePresence>
        {viewingCampaign && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingCampaign(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-[#111] border-l border-white/10 shadow-2xl z-50 flex flex-col">
              
              <div className="p-6 border-b border-white/10 bg-[#161616] flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center ${PLATFORM_ICONS[viewingCampaign.platform].color}`}>
                      {PLATFORM_ICONS[viewingCampaign.platform].icon}
                    </div>
                    <h2 className="text-[20px] font-bold text-white leading-tight">{viewingCampaign.name}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        viewingCampaign.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        viewingCampaign.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-[#222] text-[#888] border-white/10'
                      }`}>
                        {viewingCampaign.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {viewingCampaign.status}
                    </span>
                    <span className="text-[12px] text-[#666] font-mono">ID: {viewingCampaign.id}</span>
                  </div>
                </div>
                <button onClick={() => setViewingCampaign(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-[#888] hover:text-white transition-colors"><ArrowRight className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Spend</div>
                    <div className="text-[20px] font-bold text-white">${viewingCampaign.spend.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Revenue</div>
                    <div className="text-[20px] font-bold text-emerald-400">${viewingCampaign.revenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Clicks</div>
                    <div className="text-[20px] font-bold text-white">{viewingCampaign.clicks.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                    <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Purchases</div>
                    <div className="text-[20px] font-bold text-white">{viewingCampaign.conversions.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-[#161616] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> Efficiency Breakdown</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[13px] text-[#888]">Cost Per Click (CPC)</span>
                      <span className="text-[14px] font-bold text-white">
                        {viewingCampaign.clicks > 0 ? `$${(viewingCampaign.spend / viewingCampaign.clicks).toFixed(2)}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[13px] text-[#888]">Cost Per Acquisition (CPA)</span>
                      <span className="text-[14px] font-bold text-white">
                        {viewingCampaign.conversions > 0 ? `$${(viewingCampaign.spend / viewingCampaign.conversions).toFixed(2)}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-[13px] text-[#888]">Conversion Rate</span>
                      <span className="text-[14px] font-bold text-white">
                        {viewingCampaign.clicks > 0 ? `${((viewingCampaign.conversions / viewingCampaign.clicks) * 100).toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#888] font-bold">Total ROAS</span>
                      <span className="text-[16px] font-bold text-purple-400">
                        {viewingCampaign.spend > 0 ? (viewingCampaign.revenue / viewingCampaign.spend).toFixed(2) : (viewingCampaign.revenue > 0 ? '∞' : '0.00')}x
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-white/10 bg-[#161616] shrink-0 space-y-3">
                <button 
                  onClick={(e) => toggleCampaignStatus(e, viewingCampaign.id)}
                  className={`w-full text-[14px] font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    viewingCampaign.status === 'Active' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {viewingCampaign.status === 'Active' ? <><Pause className="w-4 h-4"/> Pause Campaign</> : <><Play className="w-4 h-4"/> Resume Campaign</>}
                </button>
                <button 
                  onClick={() => deleteCampaign(viewingCampaign.id)}
                  className="w-full bg-transparent hover:bg-red-500/10 text-[#888] hover:text-red-400 border border-transparent hover:border-red-500/20 text-[13px] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Campaign
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}