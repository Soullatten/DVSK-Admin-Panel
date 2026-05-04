import React, { useState, useEffect, useRef } from 'react';
import { Lock, Monitor, Smartphone, Tablet, RefreshCw, Play, Loader2, StopCircle, LayoutTemplate, ExternalLink, Terminal as TerminalIcon, Cpu, Globe, Activity, Code2, Box, Zap, X, Palette, Type, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

export default function OnlineStore() {
    // ── STATE ──
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isLive, setIsLive] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Terminal & Theme State
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
    const [activeColor, setActiveColor] = useState('purple');
    const [activeFont, setActiveFont] = useState('Inter');
    
    const STORE_URL = 'http://localhost:5173'; 
    const terminalRef = useRef<HTMLDivElement>(null);

    const deviceWidths = {
        desktop: 'w-full max-w-full',
        tablet: 'w-[820px]',
        mobile: 'w-[400px]',
    };

    // ── TERMINAL LOGIC ──
    const addLog = (log: string) => {
        setTerminalLogs(prev => [...prev, log]);
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    const simulateTerminal = (online: boolean | null = null) => {
        setTerminalLogs([]);
        const baseLogs = [
            '> dvsk-storefront@1.0.0',
            '> probing http://localhost:5173 ...',
        ];
        baseLogs.forEach((log, index) => {
            setTimeout(() => addLog(log), index * 400);
        });
        if (online === true) {
            setTimeout(() => addLog('  ➜  Local:   http://localhost:5173/'), 1200);
            setTimeout(() => addLog('✓ storefront reachable · attaching preview'), 1800);
        } else if (online === false) {
            setTimeout(() => addLog('> [WARN] storefront did not respond'), 1200);
            setTimeout(() => addLog('> [HINT] open a terminal in DVSK/ and run: npm run dev'), 1800);
        }
    };

    // ── HANDLERS ──
    const handleGoLive = async () => {
        setIsStarting(true);
        simulateTerminal();

        try {
            const { data } = await apiClient.get('/admin/storefront-status');
            const online: boolean = !!data?.data?.online;

            setTimeout(() => {
                simulateTerminal(online);
                setTimeout(() => {
                    if (online) {
                        setIsLive(true);
                        setIsStarting(false);
                        toast.success('Storefront online · Preview attached', { icon: '🟢', style: { background: '#111', color: '#fff', border: '1px solid #34d399' } });
                    } else {
                        setIsStarting(false);
                        toast.error('Storefront not running. Start it with: cd DVSK && npm run dev');
                    }
                }, 2000);
            }, 1200);
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Connection failed';
            setTimeout(() => {
                setIsStarting(false);
                addLog(`> [FATAL] ${msg}`);
                toast.error(`Failed to reach DVSK backend: ${msg}`);
            }, 1500);
        }
    };

    const handleStopServer = () => {
        setIsLive(false);
        setIsThemePanelOpen(false);
        setTerminalLogs(['> server gracefully terminated.', 'connection closed.']);
        toast('Server Offline', { icon: '🛑', style: { background: '#111', color: '#fff', border: '1px solid #ef4444' } });
    };

    const handleDeviceChange = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
        setDevice(newDevice);
        if (isLive) addLog(`> [HMR] Viewport constraints updated to ${newDevice}`);
    };

    const handleRefreshPreview = () => {
        if (!isLive) return;
        setIsRefreshing(true);
        addLog('> [Vite] client triggered full page reload...');
        
        const iframe = document.getElementById('engine-frame') as HTMLIFrameElement;
        if (iframe) iframe.src = iframe.src;

        setTimeout(() => {
            setIsRefreshing(false);
            addLog('✓ page reloaded successfully');
        }, 800);
    };

    const handleEditCode = () => {
        if (!isLive) return toast.error('Start the server first');
        addLog('> [IDE] Establishing connection to local workspace...');
        toast.success('Connected to VS Code Server', { icon: '💻' });
    };

    const updateThemeSettings = (type: 'color' | 'font', value: string) => {
        if (type === 'color') setActiveColor(value);
        if (type === 'font') setActiveFont(value);
        if (isLive) addLog(`✓ [HMR] Theme.css hot-updated (${type}: ${value})`);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#050505] font-sans text-[#ececec] pb-24 selection:bg-purple-500/30 overflow-hidden relative">
            
            {/* Cinematic Background */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-purple-900/10 blur-[150px] pointer-events-none mix-blend-screen rounded-[100%]" />

            <div className="w-full max-w-[1400px] px-6 lg:px-8 py-8 mx-auto relative z-10 space-y-6">
                
                {/* ── HEADER ── */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                <Globe className="w-4 h-4 text-purple-400" />
                            </div>
                            <h1 className="text-[26px] font-bold text-white tracking-tight leading-none">Storefront Engine</h1>
                        </div>
                        <p className="text-[14px] text-[#888] font-medium ml-11">Command center for your live presentation layer.</p>
                    </div>
                </div>

                {/* ── TOP BENTO GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Server Status Card */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu className="w-24 h-24 text-white" />
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#888]" />
                                <h2 className="text-[12px] font-bold text-[#888] uppercase tracking-widest">Compiler Status</h2>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    {isLive && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40" />}
                                    <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${isLive ? 'bg-emerald-400 text-emerald-400' : 'bg-[#333] text-transparent'}`} />
                                </div>
                                <span className={`text-[20px] font-bold tracking-tight ${isLive ? 'text-white' : 'text-[#666]'}`}>
                                    {isLive ? 'System Online' : 'System Offline'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8">
                            {isLive ? (
                                <button onClick={handleStopServer} className="w-full py-3 rounded-xl text-[13px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2">
                                    <StopCircle className="w-4 h-4" /> Terminate Server
                                </button>
                            ) : (
                                <button onClick={handleGoLive} disabled={isStarting} className="w-full py-3 rounded-xl text-[13px] font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50">
                                    {isStarting ? <><Loader2 className="w-4 h-4 animate-spin" /> Booting Sequence...</> : <><Play className="w-4 h-4 fill-current" /> Ignite Engine</>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Active Theme Card */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4 text-[#888]" />
                                    <h2 className="text-[12px] font-bold text-[#888] uppercase tracking-widest">Active Theme</h2>
                                </div>
                                <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Default</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                                    {/* Dynamic Color Indicator */}
                                    <div className={`absolute inset-0 opacity-20 ${activeColor === 'purple' ? 'bg-purple-500' : activeColor === 'blue' ? 'bg-blue-500' : activeColor === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <Box className="w-6 h-6 text-white relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-bold text-white">DVSK Core</h3>
                                    <p className="text-[12px] text-[#666] mt-0.5">Using {activeFont} • Tailwind</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3 relative z-10">
                            <button onClick={handleEditCode} className="flex-1 py-3 rounded-xl text-[13px] font-bold text-[#aaa] bg-[#111] border border-white/5 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                <Code2 className="w-4 h-4" /> Edit Code
                            </button>
                            <button onClick={() => {
                                if(!isLive) return toast.error('Start server to access Customizer');
                                setIsThemePanelOpen(true);
                                addLog('> [Customizer] Interface opened');
                            }} className="w-12 h-[46px] rounded-xl text-[#aaa] bg-[#111] border border-white/5 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center active:scale-[0.98]">
                                <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 3. Terminal Simulator */}
                    <div className="bg-[#050505] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col font-mono h-full min-h-[220px]">
                        <div className="h-10 bg-[#111] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-3.5 h-3.5 text-[#666]" />
                                <span className="text-[11px] text-[#666]">bash - engine</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                            </div>
                        </div>
                        <div ref={terminalRef} className="p-4 text-[12px] text-[#888] flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-start">
                            {terminalLogs.length === 0 && !isStarting && !isLive && (
                                <p className="opacity-50 mt-auto">Waiting for command...</p>
                            )}
                            <AnimatePresence>
                                {terminalLogs.map((log, i) => (
                                    <motion.div 
                                        key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                        className={`whitespace-pre-wrap leading-[1.7] ${log.includes('✓') ? 'text-emerald-400' : log.includes('➜') ? 'text-blue-400' : log.includes('[HMR]') ? 'text-amber-400' : log.includes('[IDE]') ? 'text-purple-400' : 'text-[#888]'}`}
                                    >
                                        {log}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {(isStarting || isLive) && (
                                <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-white/50 mt-1 shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── THE PRESENTATION STAGE ── */}
                <div className="mt-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden relative">
                    
                    {/* Architectural Grid Background */}
                    <div className="absolute inset-0 opacity-[0.15]" 
                        style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 to-[#0a0a0a]" />

                    <div className="relative z-10 flex flex-col items-center pt-10 pb-16 px-6 min-h-[800px]">
                        
                        {/* Device Navigation Toggles */}
                        <div className="mb-8 flex items-center p-1.5 bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                            {(['desktop', 'tablet', 'mobile'] as const).map((type) => (
                                <button 
                                    key={type} onClick={() => handleDeviceChange(type)}
                                    className={`px-5 py-2 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all duration-300 ${device === type ? 'bg-white text-black shadow-lg' : 'text-[#666] hover:text-white hover:bg-white/5'}`}
                                >
                                    {type === 'desktop' && <Monitor className="w-4 h-4" />}
                                    {type === 'tablet' && <Tablet className="w-4 h-4" />}
                                    {type === 'mobile' && <Smartphone className="w-4 h-4" />}
                                    <span className="capitalize hidden sm:block">{type}</span>
                                </button>
                            ))}
                            
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            
                            <button onClick={() => isLive && window.open(STORE_URL, '_blank')} disabled={!isLive} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all ${isLive ? 'text-purple-400 hover:bg-purple-500/10' : 'text-[#333] cursor-not-allowed'}`}>
                                Open <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Browser Window Wrapper */}
                        <motion.div 
                            layout 
                            className={`${deviceWidths[device]} h-[700px] bg-[#050505] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/5 relative origin-top`}
                        >
                            {/* Browser Chrome */}
                            <div className="h-12 bg-[#111] border-b border-white/5 flex items-center px-4 relative">
                                <div className="flex items-center gap-2 absolute left-4">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500" />
                                </div>
                                
                                <div className="mx-auto flex items-center gap-2 bg-[#0a0a0a] border border-white/5 px-4 py-1.5 rounded-lg w-full max-w-sm overflow-hidden">
                                    <Lock className={`w-3 h-3 ${isLive ? 'text-emerald-400' : 'text-[#444]'}`} />
                                    <span className={`text-[12px] font-mono ${isLive ? 'text-[#aaa]' : 'text-[#444]'}`}>localhost:5173</span>
                                </div>

                                <button onClick={handleRefreshPreview} className={`absolute right-4 p-1.5 rounded-lg transition-colors ${isLive ? 'text-[#666] hover:text-white hover:bg-white/5' : 'text-[#333] cursor-not-allowed'}`}>
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                                </button>
                            </div>

                            {/* Presentation iFrame */}
                            <div className="flex-1 relative bg-[#050505]">
                                {isLive ? (
                                    <>
                                        <iframe 
                                            id="engine-frame"
                                            src={STORE_URL} 
                                            className={`w-full h-full border-none bg-white transition-opacity duration-300 ${isRefreshing ? 'opacity-30' : 'opacity-100'}`}
                                            title="Store Engine Preview"
                                        />
                                        {/* Loading Overlay during refresh */}
                                        <AnimatePresence>
                                            {isRefreshing && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-lg" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] to-[#050505]">
                                        <div className="relative mb-6">
                                            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transform rotate-45 shadow-2xl">
                                                <LayoutTemplate className="w-8 h-8 text-[#444] -rotate-45" />
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-[20px] tracking-tight">Presentation Engine Offline</h3>
                                        <p className="text-[#666] text-[14px] mt-2 max-w-[300px] leading-relaxed">
                                            The frontend compiler is currently inactive. Ignite the engine to preview the React application.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── SLIDE-OUT THEME CUSTOMIZER PANEL ── */}
            <AnimatePresence>
                {isThemePanelOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setIsThemePanelOpen(false); addLog('> [Customizer] Interface closed'); }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[380px] bg-[#0a0a0a] border-l border-white/10 z-[110] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                        <Palette className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <h2 className="text-[16px] font-bold text-white">Theme Settings</h2>
                                </div>
                                <button onClick={() => { setIsThemePanelOpen(false); addLog('> [Customizer] Interface closed'); }} className="p-2 rounded-xl hover:bg-white/5 text-[#888] hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-8">
                                {/* Color Selection */}
                                <div>
                                    <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-4 flex items-center gap-2"><Palette className="w-3.5 h-3.5"/> Primary Brand Color</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['purple', 'blue', 'emerald', 'rose'].map((color) => (
                                            <button 
                                                key={color} onClick={() => updateThemeSettings('color', color)}
                                                className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${activeColor === color ? 'border-white scale-105 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color === 'purple' ? '#a855f7' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f43f5e' }}
                                            >
                                                {activeColor === color && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Typography Selection */}
                                <div>
                                    <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-4 flex items-center gap-2"><Type className="w-3.5 h-3.5"/> Base Typography</h3>
                                    <div className="space-y-3">
                                        {['Inter', 'SF Pro Display', 'Space Mono'].map((font) => (
                                            <button 
                                                key={font} onClick={() => updateThemeSettings('font', font)}
                                                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${activeFont === font ? 'bg-white/10 border-white/30 text-white' : 'bg-[#111] border-white/5 text-[#888] hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <span className="font-bold">{font}</span>
                                                <div className="text-[10px] uppercase tracking-wider opacity-50">Aa</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Components Selection */}
                                <div>
                                    <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-4 flex items-center gap-2"><MousePointer2 className="w-3.5 h-3.5"/> Button Style</h3>
                                    <div className="flex gap-3">
                                        <div className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-[12px] font-bold text-[#888] hover:text-white hover:border-white/50 cursor-pointer transition-all">Pill</div>
                                        <div className="flex-1 h-12 rounded-lg border border-white/20 flex items-center justify-center text-[12px] font-bold text-white bg-white/5 cursor-pointer transition-all">Rounded</div>
                                        <div className="flex-1 h-12 border border-white/20 flex items-center justify-center text-[12px] font-bold text-[#888] hover:text-white hover:border-white/50 cursor-pointer transition-all">Sharp</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-white/5 bg-[#111]">
                                <button onClick={() => { setIsThemePanelOpen(false); addLog('> [Customizer] Interface closed'); toast.success('Changes saved'); }} className="w-full py-3 rounded-xl bg-white text-black font-bold text-[14px] hover:bg-[#ececec] transition-colors shadow-lg">
                                    Save Architecture
                                </button>
                            </div>
                        </motion.div>
                    </>
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