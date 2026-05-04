import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, FileText, Plus, Bell, Info, ExternalLink, Zap, Filter, X, Download, Trash2, BarChart3, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';
import { apiClient } from '../api/client';
import { connectLiveFeed } from '../lib/liveSocket';

// --- Custom Animated Neon Checkbox ---
const GlowingCheckbox = ({ checked, onChange, id }: { checked: boolean, onChange: () => void, id: string }) => (
    <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <input 
            type="checkbox" 
            className="custom-scribble-check hidden" 
            id={id} 
            checked={checked} 
            onChange={onChange} 
        />
        <label htmlFor={id} className="cursor-pointer relative flex items-center justify-center m-0 p-1 rounded-md hover:bg-white/5 transition-colors">
            <svg width={32} height={32} viewBox="0 0 95 95" className="overflow-visible">
                {/* Checkbox Outline */}
                <rect 
                    x={30} y={20} width={50} height={50} rx={12} 
                    className={`transition-colors duration-300 fill-[#0a0a0a] stroke-[4px] ${checked ? 'stroke-[#c084fc] shadow-[0_0_10px_#c084fc]' : 'stroke-white/20'}`} 
                />
                {/* Animated Scribble Path */}
                <g transform="translate(0,-952.36222)">
                    <path 
                        d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4" 
                        stroke="#c084fc" 
                        strokeWidth={6} 
                        strokeLinecap="round"
                        fill="none" 
                        className="scribble-path"
                        style={{ filter: 'drop-shadow(0px 0px 8px rgba(192,132,252,0.9))' }}
                    />
                </g>
            </svg>
        </label>
    </div>
);

// --- Initial Data: hydrated from /admin/reports ---
type ReportRow = {
  id?: string;
  name: string;
  category: string;
  lastViewed: string;
  views: number;
  value?: string;
  sub?: string;
  info?: boolean;
  bell?: boolean;
  link?: boolean;
};
const initialReports: ReportRow[] = [];

const categories = ['All Categories', 'Orders', 'Acquisition', 'Behavior', 'Customers', 'Finances'];

const categoryColors: Record<string, string> = {
    Orders: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
    Acquisition: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    Behavior: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    Customers: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    Finances: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
};

function SystemIcon() {
    return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
        </span>
    );
}

export default function Reports() {
    // --- Application State ---
    const [reports, setReports] = useState(initialReports);

    const fetchReports = async () => {
      try {
        const res = await apiClient.get('/admin/reports');
        const items = res.data?.data ?? [];
        if (Array.isArray(items)) {
          setReports(items.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            lastViewed: r.lastViewed,
            views: r.views || 0,
            value: r.value,
            sub: r.sub,
          })));
        }
      } catch (err) {
        console.error('[Reports] failed to load:', err);
      }
    };

    useEffect(() => {
      fetchReports();
    }, []);

    useEffect(() => {
      let cancelled = false;
      let socket: Socket | null = null;
      (async () => {
        socket = await connectLiveFeed();
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socket.on('order:placed', fetchReports);
      })();
      return () => {
        cancelled = true;
        socket?.disconnect();
      };
    }, []);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    
    // Interactive Features State
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [previewReport, setPreviewReport] = useState<typeof initialReports[0] | null>(null);

    // New Report Form State
    const [newReportName, setNewReportName] = useState('');
    const [newReportCat, setNewReportCat] = useState('Orders');

    const pageSize = 8;

    // --- Core Logic: Filtering & Sorting ---
    const processedReports = useMemo(() => {
        let result = reports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
        
        if (selectedCategory !== 'All Categories') {
            result = result.filter(r => r.category === selectedCategory);
        }

        result.sort((a, b) => {
            if (sortConfig.key === 'name') {
                return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            if (sortConfig.key === 'views') {
                return sortConfig.direction === 'asc' ? a.views - b.views : b.views - a.views;
            }
            return 0;
        });

        return result;
    }, [reports, search, selectedCategory, sortConfig]);

    const totalPages = Math.ceil(processedReports.length / pageSize) || 1;
    const paginated = processedReports.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => { setPage(1); }, [search, selectedCategory]);

    // --- Action Handlers ---
    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleRow = (name: string) => {
        setSelectedRows(prev => prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]);
    };

    const toggleAll = () => {
        if (selectedRows.length === paginated.length && paginated.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginated.map(r => r.name));
        }
    };

    const handleCreateReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReportName.trim()) return toast.error('Please enter a report name');
        
        const newReport = {
            name: newReportName,
            category: newReportCat,
            lastViewed: 'Just now',
            views: 0,
            info: true
        };
        
        setReports([newReport, ...reports]);
        setIsCreateModalOpen(false);
        setNewReportName('');
        toast.success(`Created "${newReportName}"`, { icon: '✨' });
    };

    const handleBulkDelete = () => {
        setReports(prev => prev.filter(r => !selectedRows.includes(r.name)));
        toast.success(`Deleted ${selectedRows.length} reports`, { icon: '🗑️' });
        setSelectedRows([]);
    };

    const handleBulkExport = () => {
        toast.success(`Exporting ${selectedRows.length} reports to CSV...`, { icon: '📦' });
        setTimeout(() => {
            setSelectedRows([]);
            toast.success('Download complete!');
        }, 1500);
    };

    return (
        <div className="min-h-full bg-[#0a0a0a] font-sans pb-32 text-[#ececec] relative overflow-hidden selection:bg-purple-500/30">
            
            {/* CSS for Animated Scribble Checkbox */}
            <style dangerouslySetInnerHTML={{__html: `
                .scribble-path {
                    stroke-dasharray: 400;
                    stroke-dashoffset: 400;
                    transition: 0.5s stroke-dashoffset cubic-bezier(0.4, 0, 0.2, 1), 0.2s opacity ease-out;
                    opacity: 0;
                }
                .custom-scribble-check:checked + label .scribble-path {
                    stroke-dashoffset: 0;
                    opacity: 1;
                }
            `}} />

            {/* ── BACKGROUND ORBS ── */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-[1400px] px-6 lg:px-8 py-8 mx-auto relative z-10">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-[24px] font-bold text-white tracking-tight">Reports Library</h1>
                            <p className="text-[13px] text-[#888] font-medium mt-0.5">Explore, create, and generate data insights</p>
                        </div>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-[14px] font-bold px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New exploration
                    </motion.button>
                </div>

                {/* ── MAIN DATA CONTAINER ── */}
                <div className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl relative">
                    
                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 px-4 py-4 border-b border-white/10 bg-[#161616]">
                        <div className="flex-1 w-full flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-purple-500/50 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all">
                            <Search className="w-4 h-4 text-[#666]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search reports..."
                                className="flex-1 bg-transparent text-[13px] font-medium text-white focus:outline-none placeholder-[#666]"
                            />
                        </div>
                        
                        {/* Interactive Category Dropdown */}
                        <div className="relative w-full sm:w-auto">
                            <button 
                                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                className={`w-full flex items-center justify-between gap-3 text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all border ${selectedCategory !== 'All Categories' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-[#0a0a0a] text-[#aaa] hover:text-white border-white/10 hover:border-white/20'}`}
                            >
                                <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> {selectedCategory}</span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            <AnimatePresence>
                                {isCatDropdownOpen && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                        className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                                        {categories.map(cat => (
                                            <button key={cat} onClick={() => { setSelectedCategory(cat); setIsCatDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-colors ${selectedCategory === cat ? 'text-purple-400 bg-purple-500/10' : 'text-white hover:bg-white/5'}`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#161616]/50">
                                    <th className="px-4 py-4 w-12 text-center">
                                        <GlowingCheckbox 
                                            id="selectAll"
                                            checked={selectedRows.length === paginated.length && paginated.length > 0} 
                                            onChange={toggleAll} 
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                            Report Name <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('views')}>
                                            Views <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortConfig.key === 'views' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {paginated.length > 0 ? (
                                        paginated.map((report) => {
                                            const isSelected = selectedRows.includes(report.name);
                                            return (
                                                <motion.tr 
                                                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                                    key={report.name} 
                                                    className={`border-b border-white/5 transition-colors group cursor-pointer ${isSelected ? 'bg-purple-500/10' : 'hover:bg-white/5'}`}
                                                    onClick={() => toggleRow(report.name)}
                                                >
                                                    <td className="px-4 py-4 text-center">
                                                        <GlowingCheckbox 
                                                            id={`select-${report.name.replace(/\s+/g, '-')}`}
                                                            checked={isSelected} 
                                                            onChange={() => toggleRow(report.name)} 
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setPreviewReport(report); }}
                                                                className={`text-[14px] font-bold text-left transition-colors ${report.link ? 'text-purple-400 hover:text-purple-300' : 'text-[#ececec] group-hover:text-white hover:underline'}`}
                                                            >
                                                                {report.name}
                                                            </button>
                                                            {report.link && <ExternalLink className="w-3.5 h-3.5 text-purple-400" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${categoryColors[report.category] ?? 'bg-white/5 text-[#888] border-white/10'}`}>
                                                            {report.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[13px] font-medium text-[#aaa]">
                                                        {report.views.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-[13px] font-medium ${report.lastViewed === 'Just now' ? 'text-emerald-400 flex items-center gap-1.5' : 'text-[#888]'}`}>
                                                                {report.lastViewed === 'Just now' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                                                {report.lastViewed || 'Ready to view'}
                                                            </span>
                                                            <button onClick={(e) => { e.stopPropagation(); toast.success('Notifications set'); }} className="p-1.5 text-[#666] hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                                <Bell className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-[#666]">
                                                <Search className="w-8 h-8 mb-3 opacity-20 mx-auto" />
                                                <p className="text-[14px] font-bold text-[#888]">No reports found</p>
                                                <p className="text-[12px] mt-1">Try adjusting your filters.</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161616]">
                        <div className="text-[13px] font-bold text-[#666]">
                            Showing <span className="text-[#ececec]">{paginated.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="text-[#ececec]">{Math.min(page * pageSize, processedReports.length)}</span> of <span className="text-[#ececec]">{processedReports.length}</span> reports
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-[13px] font-bold text-[#888] px-2">Page {page} of {totalPages}</div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── FLOATING BULK ACTION BAR ── */}
            <AnimatePresence>
                {selectedRows.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/90 backdrop-blur-xl border border-purple-500/30 shadow-[0_20px_50px_rgba(192,132,252,0.15)] rounded-full px-6 py-3 flex items-center gap-6 z-[60]"
                    >
                        <div className="flex items-center gap-2 text-[13px] font-bold text-white">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">{selectedRows.length}</div>
                            reports selected
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <button onClick={handleBulkExport} className="text-[13px] font-bold text-[#ececec] hover:text-white flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button onClick={handleBulkDelete} className="text-[13px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-400/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CREATE REPORT MODAL ── */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                        <motion.form 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onSubmit={handleCreateReport}
                            className="bg-[#111] border border-white/10 shadow-2xl rounded-2xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="text-[18px] font-bold text-white">Create Exploration</h2>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1 text-[#666] hover:text-white rounded-lg hover:bg-white/5 transition-colors"><X className="w-5 h-5"/></button>
                                </div>
                                <p className="text-[13px] text-[#888]">Build a custom data query for your dashboard.</p>
                            </div>
                            
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[13px] font-bold text-[#aaa] mb-2 uppercase tracking-wider">Report Name</label>
                                    <input 
                                        type="text" autoFocus required value={newReportName} onChange={e => setNewReportName(e.target.value)}
                                        placeholder="e.g. Q3 Hoodie Sales"
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-[#aaa] mb-2 uppercase tracking-wider">Category</label>
                                    <div className="relative">
                                        <select 
                                            value={newReportCat} onChange={e => setNewReportCat(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none appearance-none cursor-pointer"
                                        >
                                            {categories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-[14px] font-bold text-[#ececec] hover:text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-[14px] font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(192,132,252,0.3)] rounded-xl transition-all">Generate Report</button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

            {/* ── REPORT PREVIEW SLIDE-OVER ── */}
            <AnimatePresence>
                {previewReport && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewReport(null)} />
                        
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-[#111] border-l border-white/10 h-full relative z-10 shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mb-2 ${categoryColors[previewReport.category] ?? 'bg-white/5 text-[#888] border-white/10'}`}>
                                        {previewReport.category}
                                    </span>
                                    <h2 className="text-[20px] font-bold text-white leading-tight">{previewReport.name}</h2>
                                </div>
                                <button onClick={() => setPreviewReport(null)} className="p-2 text-[#666] hover:text-white hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {/* Fake Data Visualization */}
                                <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-5 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[13px] font-bold text-[#888]">Overview Trend</span>
                                        <BarChart3 className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="h-32 flex items-end justify-between gap-2">
                                        {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
                                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.1 + (i * 0.05) }} className="w-full bg-purple-500/20 rounded-t-sm hover:bg-purple-500/40 cursor-pointer transition-colors relative group">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100">{h}k</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[13px] text-[#888] font-medium">Total Views</span>
                                        <span className="text-[14px] font-bold text-white">{previewReport.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[13px] text-[#888] font-medium">Status</span>
                                        <span className="text-[13px] font-bold text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Active Sync</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[13px] text-[#888] font-medium">Data Source</span>
                                        <span className="text-[13px] font-bold text-[#ececec] flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-400"/> DVSK Production</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-[#161616]">
                                <button onClick={() => toast('Opening full dashboard...')} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-[14px] font-bold rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center justify-center gap-2">
                                    Open Full Dashboard <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}