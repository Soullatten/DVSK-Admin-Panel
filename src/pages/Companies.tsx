import React, { useState } from 'react';
import { 
  Building2, 
  Handshake, 
  Factory, 
  Video, // Changed from Instagram to Video
  Plus, 
  Search, 
  Play, 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  X, 
  Mail, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types & Demo Data ──
type TabType = 'sponsors' | 'suppliers' | 'reels';

interface Company {
  id: string;
  name: string;
  type: string;
  status: 'Pending' | 'Active' | 'Reviewing';
  contact: string;
  budgetOrTerms: string;
  location: string;
}

interface Reel {
  id: string;
  creator: string;
  handle: string;
  views: string;
  likes: string;
  comments: string;
  productFeatured: string;
  status: 'Live' | 'Awaiting Approval';
  gradient: string;
}

const DEMO_SPONSORS: Company[] = [
  { id: 'SP-1', name: 'RedBull Energy', type: 'Event Sponsor', status: 'Reviewing', contact: 'partners@redbull.com', budgetOrTerms: '$5,000 / event', location: 'Austria' },
  { id: 'SP-2', name: 'Complex Media', type: 'Media Coverage', status: 'Pending', contact: 'collab@complex.com', budgetOrTerms: 'Revenue Split', location: 'New York, USA' },
  { id: 'SP-3', name: 'SneakerCon', type: 'Booth Sponsor', status: 'Active', contact: 'hello@sneakercon.com', budgetOrTerms: 'Prime Booth Space', location: 'Los Angeles, USA' },
];

const DEMO_SUPPLIERS: Company[] = [
  { id: 'SU-1', name: 'Apex Textiles Ltd.', type: 'Fabric Manufacturer', status: 'Active', contact: 'sales@apextex.com', budgetOrTerms: 'Net 30', location: 'Guangzhou, CN' },
  { id: 'SU-2', name: 'Global Freight Fast', type: 'Logistics', status: 'Active', contact: 'dispatch@gff.com', budgetOrTerms: 'Net 60', location: 'Mumbai, IN' },
  { id: 'SU-3', name: 'Premium Tags Co.', type: 'Packaging', status: 'Pending', contact: 'orders@premtags.com', budgetOrTerms: 'Pay on Order', location: 'Toronto, CA' },
];

const DEMO_REELS: Reel[] = [
  { id: 'R-1', creator: 'Jordan K.', handle: '@jordan.kicks', views: '124.5k', likes: '12.2k', comments: '342', productFeatured: 'Heavyweight Hoodie', status: 'Live', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'R-2', creator: 'Mia Styles', handle: '@mia_fits', views: '89.2k', likes: '8.4k', comments: '156', productFeatured: 'Summer Cap Drop', status: 'Live', gradient: 'from-pink-500 to-rose-500' },
  { id: 'R-3', creator: 'Streetwear Daily', handle: '@streetweardaily', views: '45.1k', likes: '4.1k', comments: '89', productFeatured: 'DVSK Cargo Pants', status: 'Awaiting Approval', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'R-4', creator: 'Alex Chen', handle: '@achen_style', views: '210.8k', likes: '24.5k', comments: '892', productFeatured: 'Heavyweight Hoodie', status: 'Live', gradient: 'from-blue-500 to-cyan-500' },
];

export default function Companies() {
  const { data: liveData } = useMainWebsite('/companies');
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('sponsors');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'Supplier' | 'Sponsor'>('Supplier');
  
  const [viewingReel, setViewingReel] = useState<Reel | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Company | null>(null);

  // New Company Form State
  const [newCompany, setNewCompany] = useState({ name: '', type: '', email: '' });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.email) return toast.error("Please fill in required fields.");
    
    setIsAddModalOpen(false);
    toast.success(`Successfully added ${newCompany.name} to ${addType}s!`);
    setNewCompany({ name: '', type: '', email: '' });
  };

  const handleAcceptProposal = () => {
    toast.success(`Proposal from ${viewingProposal?.name} accepted! An email has been sent.`);
    setViewingProposal(null);
  };

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-60px)] relative overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Partners & UGC</h1>
            <p className="text-[14px] text-[#888] mt-1">Manage suppliers, brand sponsorships, and creator content.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(249,115,22,0.25)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        </div>
      </div>

      {/* ── CUSTOM TABS ── */}
      <div className="flex items-center gap-2 bg-[#161616] border border-white/10 p-1.5 rounded-2xl w-fit mb-6 shrink-0">
        {[
          { id: 'sponsors', label: 'Sponsorships', icon: Handshake },
          { id: 'suppliers', label: 'Suppliers & Mfg', icon: Factory },
          { id: 'reels', label: 'UGC & Reels', icon: Video }, // Changed icon here
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors z-10 ${activeTab === tab.id ? 'text-white' : 'text-[#888] hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#222] border border-white/5 rounded-xl -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT: SPONSORS OR SUPPLIERS ── */}
      {(activeTab === 'sponsors' || activeTab === 'suppliers') && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-5 border-b border-white/10 bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <h2 className="text-[15px] font-semibold text-white">
              {activeTab === 'sponsors' ? 'Inbound Sponsorship Proposals' : 'Active Manufacturing Partners'}
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search companies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 text-white text-[13px] rounded-xl pl-9 pr-4 py-2 w-full sm:w-[250px] outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'sponsors' ? DEMO_SPONSORS : DEMO_SUPPLIERS)
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((company) => (
                <div key={company.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-white">{company.name}</h3>
                        <span className="text-[11px] text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-white/5">{company.type}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      company.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      company.status === 'Reviewing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {company.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-[13px] text-[#888]"><Mail className="w-4 h-4"/> {company.contact}</div>
                    <div className="flex items-center gap-2 text-[13px] text-[#888]"><MapPin className="w-4 h-4"/> {company.location}</div>
                    <div className="flex items-center gap-2 text-[13px] text-[#888]"><TrendingUp className="w-4 h-4"/> {activeTab === 'sponsors' ? 'Offer: ' : 'Terms: '} <strong className="text-white">{company.budgetOrTerms}</strong></div>
                  </div>

                  {activeTab === 'sponsors' ? (
                    <button onClick={() => setViewingProposal(company)} className="w-full bg-[#1a1a1a] border border-white/10 text-white text-[13px] font-bold py-2.5 rounded-xl hover:bg-orange-500 hover:border-orange-500 transition-colors">
                      Review Proposal
                    </button>
                  ) : (
                    <button onClick={() => toast.success(`Viewing orders for ${company.name}`)} className="w-full bg-[#1a1a1a] border border-white/10 text-white text-[13px] font-bold py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      View Active Orders
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB CONTENT: CREATOR REELS ── */}
      {activeTab === 'reels' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
            {DEMO_REELS.map((reel) => (
              <div key={reel.id} className="relative group rounded-3xl overflow-hidden bg-[#111] border border-white/10 aspect-[9/16] shadow-xl cursor-pointer" onClick={() => setViewingReel(reel)}>
                <div className={`absolute inset-0 bg-gradient-to-br ${reel.gradient} opacity-80 group-hover:scale-105 transition-transform duration-700`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-pink-400" /> {/* Changed icon here too */}
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Reel</span>
                  </div>
                  {reel.status === 'Live' ? (
                    <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-3 py-1.5 rounded-full">
                      <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">Pending</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-white/20 overflow-hidden flex items-center justify-center text-black font-bold text-[14px]">
                      {reel.creator.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-white leading-tight">{reel.creator}</div>
                      <div className="text-[12px] text-white/70">{reel.handle}</div>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3">
                    <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1">Product Tagged</div>
                    <div className="text-[13px] font-semibold text-white truncate">{reel.productFeatured}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-white"><Play className="w-4 h-4" /> <span className="text-[12px] font-bold">{reel.views}</span></div>
                    <div className="flex items-center gap-1.5 text-white"><Heart className="w-4 h-4" fill="currentColor" /> <span className="text-[12px] font-bold">{reel.likes}</span></div>
                    <div className="flex items-center gap-1.5 text-white"><MessageCircle className="w-4 h-4" fill="currentColor" /> <span className="text-[12px] font-bold">{reel.comments}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MODAL: ADD COMPANY / PARTNER ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161616]">
                <h2 className="text-[18px] font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-orange-400" /> Add New Partner</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[#888] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddCompany} className="p-6 space-y-6">
                
                <div>
                  <label className="block text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Partner Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAddType('Supplier')} className={`py-3 rounded-xl text-[14px] font-bold border transition-all flex items-center justify-center gap-2 ${addType === 'Supplier' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white'}`}>
                      <Factory className="w-4 h-4"/> Manufacturer / Logistics
                    </button>
                    <button type="button" onClick={() => setAddType('Sponsor')} className={`py-3 rounded-xl text-[14px] font-bold border transition-all flex items-center justify-center gap-2 ${addType === 'Sponsor' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-[#1a1a1a] border-white/10 text-[#888] hover:text-white'}`}>
                      <Handshake className="w-4 h-4"/> Sponsor / Collaborator
                    </button>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/10" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Company Name *</label>
                    <input type="text" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-orange-500/50" placeholder="e.g. Apex Textiles" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Contact Email *</label>
                    <input type="email" required value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-orange-500/50" placeholder="hello@company.com" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Specialty / Role</label>
                    <input type="text" value={newCompany.type} onChange={e => setNewCompany({...newCompany, type: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-orange-500/50" placeholder="e.g. Fabric Supplier" />
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end gap-3 border-t border-white/10 mt-6">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(249,115,22,0.25)] flex items-center gap-2">
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: VIEW PROPOSAL ── */}
      <AnimatePresence>
        {viewingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-8 text-center border-b border-white/10 relative">
                <button onClick={() => setViewingProposal(null)} className="absolute top-4 right-4 text-[#888] hover:text-white bg-white/5 rounded-full p-1"><X className="w-5 h-5" /></button>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[28px] mx-auto mb-4">
                  {viewingProposal.name.charAt(0)}
                </div>
                <h2 className="text-[22px] font-bold text-white mb-1">{viewingProposal.name}</h2>
                <div className="text-[13px] text-blue-400 font-bold uppercase tracking-wider">{viewingProposal.type}</div>
              </div>
              <div className="p-6 space-y-4 bg-[#161616]">
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-[13px] text-[#888]">Proposed Budget</span>
                  <span className="text-[15px] font-bold text-white">{viewingProposal.budgetOrTerms}</span>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-[13px] text-[#888]">Contact Email</span>
                  <span className="text-[13px] font-semibold text-white">{viewingProposal.contact}</span>
                </div>
                <button onClick={handleAcceptProposal} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4 transition-all">
                  Approve & Draft Contract
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: VIEW REEL PLAYER ── */}
      <AnimatePresence>
        {viewingReel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <button onClick={() => setViewingReel(null)} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"><X className="w-6 h-6" /></button>
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="flex gap-6 items-center flex-col md:flex-row">
              
              <div className="w-[340px] h-[680px] bg-black border-[6px] border-[#222] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-end p-6 shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${viewingReel.gradient} opacity-90 animate-pulse`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-0 inset-x-0 h-10 bg-black/20 flex justify-center"><div className="w-32 h-6 bg-[#222] rounded-b-3xl" /></div>
                
                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-[18px]">{viewingReel.creator.charAt(0)}</div>
                    <div>
                      <div className="text-[16px] font-bold text-white">{viewingReel.creator}</div>
                      <div className="text-[13px] text-white/80">{viewingReel.handle}</div>
                    </div>
                    <button className="ml-auto bg-white/20 backdrop-blur-md text-white text-[12px] font-bold px-4 py-1.5 rounded-full">Follow</button>
                  </div>
                  <p className="text-[14px] text-white mb-4">Obsessed with the fit of this @dvsk.official drop! 🔥 Use code JORDAN10. #streetwear #fashion</p>
                </div>
              </div>

              <div className="w-[300px] flex flex-col gap-4">
                <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-[16px] font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-pink-500" /> Reel Analytics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Total Views</div>
                      <div className="text-[24px] font-bold text-white">{viewingReel.views}</div>
                    </div>
                    <div className="h-[1px] bg-white/10" />
                    <div>
                      <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-1">Engagement</div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[15px] font-bold text-white"><Heart className="w-4 h-4 text-pink-500" fill="currentColor" /> {viewingReel.likes}</div>
                        <div className="flex items-center gap-1.5 text-[15px] font-bold text-white"><MessageCircle className="w-4 h-4 text-blue-500" fill="currentColor" /> {viewingReel.comments}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-3xl p-6 shadow-xl">
                   <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-3">Product Tagged</div>
                   <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
                     <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center"><ExternalLink className="w-4 h-4 text-[#666]" /></div>
                     <div className="flex-1 min-w-0">
                       <div className="text-[13px] font-bold text-white truncate">{viewingReel.productFeatured}</div>
                       <div className="text-[11px] text-emerald-400">In Stock</div>
                     </div>
                   </div>
                   <button onClick={() => { toast.success("Message sent to creator!"); setViewingReel(null); }} className="w-full bg-pink-600 hover:bg-pink-500 text-white text-[13px] font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(219,39,119,0.2)]">
                     DM Creator
                   </button>
                </div>
              </div>
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