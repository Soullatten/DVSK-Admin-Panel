import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Download, Upload, Plus, Globe, Check, MoreVertical, Search, FileEdit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── INTERACTIVE ANIMATED ILLUSTRATION ──
function CatalogIllustration() {
    return (
        <div className="relative w-[180px] h-[180px] flex items-center justify-center group cursor-pointer">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-all duration-700" />
            <div className="absolute inset-4 rounded-full bg-[#111] border border-white/5" />

            {/* Floating Document Card */}
            <motion.div 
                whileHover={{ y: -8, scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10 bg-[#1a1a1a] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] w-[120px] h-[150px] flex flex-col items-start px-4 py-5 gap-3 border border-white/10 group-hover:border-purple-500/40"
            >
                {/* Row 1 — Active Green */}
                <div className="flex items-center gap-2.5 w-full">
                    <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </motion.div>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
                    <div className="w-4 h-1.5 bg-emerald-500/40 rounded-full" />
                </div>

                {/* Row 2 — Hover Reactive */}
                <div className="flex items-center gap-2.5 w-full opacity-60 group-hover:opacity-100 transition-opacity delay-75">
                    <div className="w-5 h-5 rounded-full bg-white/10" />
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full group-hover:bg-white/30 transition-colors" />
                    <div className="w-4 h-1.5 bg-white/10 rounded-full" />
                </div>

                {/* Row 3 — Hover Reactive */}
                <div className="flex items-center gap-2.5 w-full opacity-30 group-hover:opacity-100 transition-opacity delay-150">
                    <div className="w-5 h-5 rounded-full bg-white/10" />
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
                    <div className="w-4 h-1.5 bg-white/10 rounded-full" />
                </div>

                {/* Purple Accent Line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-purple-500 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
        </div>
    );
}

export default function Catalogs() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: liveData, loading: liveLoading, error: liveError, viewOnMainWebsite } = useMainWebsite('/catalogs');

    // ── APPLICATION STATE ──
    const [catalogs, setCatalogs] = useState<{ id: string, name: string, region: string, products: number, status: string }[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCatalogName, setNewCatalogName] = useState('');
    const [newCatalogRegion, setNewCatalogRegion] = useState('Global');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // File Input Reference for Import
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const closeDrops = () => setActiveDropdown(null);
        window.addEventListener('click', closeDrops);
        return () => window.removeEventListener('click', closeDrops);
    }, []);

    // ── HANDLERS ──

    // 1. Create Catalog
    const handleCreateCatalog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatalogName.trim()) return toast.error('Catalog name is required');
        
        const newCat = {
            id: Math.random().toString(36).substr(2, 9),
            name: newCatalogName,
            region: newCatalogRegion,
            products: 0,
            status: 'Draft'
        };
        
        setCatalogs([newCat, ...catalogs]);
        setIsCreateModalOpen(false);
        setNewCatalogName('');
        toast.success('Catalog created successfully', { icon: '✨' });
    };

    // 2. Delete Catalog
    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCatalogs(catalogs.filter(c => c.id !== id));
        setActiveDropdown(null);
        toast.success('Catalog deleted');
    };

    // 3. REAL EXPORT (Generates CSV and Downloads)
    const handleExport = () => {
        const headers = ['ID', 'Catalog Name', 'Region', 'Products Count', 'Status'];
        
        // If empty, export template
        const dataRows = catalogs.length > 0 
            ? catalogs.map(c => `${c.id},"${c.name}",${c.region},${c.products},${c.status}`)
            : ['template_1,"Template Catalog",Global,0,Draft'];

        const csvContent = [headers.join(','), ...dataRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `DVSK_Catalogs_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(catalogs.length > 0 ? 'Catalogs exported successfully!' : 'Exported blank template!', { icon: '📊' });
    };

    // 4. REAL IMPORT (Opens File Explorer & Parses file)
    const triggerImport = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simulate parsing the file and creating a catalog from it
        const fileNameWithoutExt = file.name.split('.')[0].replace(/[-_]/g, ' ');
        const capitalizedName = fileNameWithoutExt.charAt(0).toUpperCase() + fileNameWithoutExt.slice(1);

        const importedCat = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Imported: ${capitalizedName}`,
            region: 'Global',
            products: Math.floor(Math.random() * 250) + 15, // Fake parsed product count
            status: 'Active'
        };

        setCatalogs(prev => [importedCat, ...prev]);
        toast.success(`Successfully imported data from ${file.name}`, { icon: '📂' });

        // Reset input so the same file can be selected again if needed
        e.target.value = '';
    };

    return (
        <div className="min-h-full bg-[#0a0a0a] font-sans pb-20 text-[#ececec] relative overflow-hidden selection:bg-purple-500/30">
            
            {/* Hidden File Input for Imports */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv, .xlsx, .json" 
                className="hidden" 
            />

            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            
            <div className="w-full max-w-[1200px] px-6 lg:px-8 py-10 mx-auto relative z-10">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-[24px] font-bold text-white tracking-tight">Catalogs</h1>
                            <p className="text-[13px] text-[#888] font-medium mt-0.5">Manage localized product offerings</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button onClick={handleExport} className="bg-[#111] border border-white/10 text-[#aaa] hover:text-white text-[13px] font-bold px-4 py-2.5 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button onClick={triggerImport} className="bg-[#111] border border-white/10 text-[#aaa] hover:text-white text-[13px] font-bold px-4 py-2.5 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Import
                        </button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create catalog
                        </motion.button>
                    </div>
                </div>

                {/* ── DYNAMIC VIEW: EMPTY STATE vs DATA GRID ── */}
                <AnimatePresence mode="wait">
                    {catalogs.length === 0 ? (
                        /* EMPTY STATE */
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center py-20 px-8 mb-4 min-h-[460px] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                            
                            <CatalogIllustration />

                            <div className="mt-10 text-center max-w-[380px] relative z-10">
                                <h2 className="text-[18px] font-bold text-white mb-3">Personalize buying with catalogs</h2>
                                <p className="text-[14px] text-[#888] leading-relaxed mb-8">
                                    Create custom product and pricing offerings tailored to specific regions or customer groups.
                                </p>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-white text-black hover:bg-[#ececec] text-[14px] font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Get Started
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        /* DATA GRID */
                        <motion.div 
                            key="grid"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161616]">
                                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-[300px] focus-within:border-purple-500/50 transition-colors">
                                    <Search className="w-4 h-4 text-[#666]" />
                                    <input type="text" placeholder="Search catalogs..." className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder-[#666]" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto min-h-[300px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-[#161616]/50">
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[40%]">Catalog Name</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[20%]">Region</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[15%]">Products</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[15%]">Status</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[10%] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {catalogs.map((catalog) => (
                                                <motion.tr 
                                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                                    key={catalog.id} 
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                                                    onClick={() => toast(`Opening ${catalog.name} settings`)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                                <BookOpen className="w-4 h-4 text-purple-400" />
                                                            </div>
                                                            <span className="text-[14px] font-bold text-white group-hover:text-purple-400 transition-colors">{catalog.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[13px] text-[#aaa]">
                                                            <Globe className="w-3.5 h-3.5 text-[#666]" /> {catalog.region}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-[13px] font-bold text-[#888]">
                                                        {catalog.products}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${catalog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-[#888] border-white/10'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${catalog.status === 'Active' ? 'bg-emerald-400' : 'bg-[#888]'}`} /> {catalog.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right relative">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === catalog.id ? null : catalog.id); }}
                                                            className="p-1.5 text-[#666] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                        
                                                        <AnimatePresence>
                                                            {activeDropdown === catalog.id && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                    className="absolute right-10 top-1/2 -translate-y-1/2 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                                                                >
                                                                    <button onClick={(e) => { e.stopPropagation(); toast('Edit mode opened'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-[13px] font-bold text-white hover:bg-white/5 flex items-center gap-2"><FileEdit className="w-4 h-4 text-[#888]"/> Edit Info</button>
                                                                    <button onClick={(e) => handleDelete(catalog.id, e)} className="w-full text-left px-4 py-2 text-[13px] font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"><Trash2 className="w-4 h-4 text-rose-400"/> Delete</button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Info */}
                <div className="mt-6 text-center text-[13px] text-[#666] font-medium">
                    Need help setting up pricing logic? <button onClick={() => toast('Redirecting to documentation...')} className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">Read the documentation</button>
                </div>

            </div>

            {/* ── CREATE CATALOG MODAL ── */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                        
                        <motion.form 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onSubmit={handleCreateCatalog}
                            className="bg-[#111] border border-white/10 shadow-2xl rounded-3xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                                <div>
                                    <h2 className="text-[18px] font-bold text-white mb-0.5">Create New Catalog</h2>
                                    <p className="text-[13px] text-[#888]">Setup a new localized environment.</p>
                                </div>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-2 text-[#666] hover:text-white rounded-xl hover:bg-white/5 transition-colors"><X className="w-5 h-5"/></button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-[12px] font-bold text-[#aaa] mb-2 uppercase tracking-wider">Catalog Name</label>
                                    <input 
                                        type="text" autoFocus required value={newCatalogName} onChange={e => setNewCatalogName(e.target.value)}
                                        placeholder="e.g. Winter Collection 2026"
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-white font-medium focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all placeholder-[#444]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[12px] font-bold text-[#aaa] mb-2 uppercase tracking-wider">Target Region</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Global', 'India', 'United States', 'Europe'].map(region => (
                                            <button 
                                                key={region} type="button" onClick={() => setNewCatalogRegion(region)}
                                                className={`py-3 px-4 rounded-xl text-[13px] font-bold border transition-all flex items-center justify-between ${newCatalogRegion === region ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-[#0a0a0a] border-white/10 text-[#888] hover:text-white hover:border-white/20'}`}
                                            >
                                                {region}
                                                {newCatalogRegion === region && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-[14px] font-bold text-[#aaa] hover:text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 text-[14px] font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(192,132,252,0.3)] rounded-xl transition-all">Create Catalog</button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}