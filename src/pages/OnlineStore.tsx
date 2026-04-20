import React, { useState, useEffect, useRef } from 'react';
import { Eye, Lock, Zap, Monitor, Smartphone, Tablet, RefreshCw, ChevronDown, Play, Loader2, Globe as GlobeIcon, MapPin, Server, Activity } from 'lucide-react';
import createGlobe from 'cobe'; 

// A stunning, high-performance interactive globe component
function WorldGlobe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        
        if (!canvasRef.current) return;
        
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 800 * 2,
            height: 800 * 2,
            phi: 0,
            theta: 0.3,
            dark: 0, // 0 for light theme (set to 1 for dark mode)
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.95, 0.95, 0.95],
            markerColor: [0.0, 0.54, 0.36], // DVSK Green
            glowColor: [0.9, 0.9, 0.9],
            markers: [
                // Accurate Global Server / Store Locations
                { location: [23.0225, 72.5714], size: 0.1 }, // Ahmedabad, India (HQ)
                { location: [40.7128, -74.0060], size: 0.05 }, // New York, USA
                { location: [51.5074, -0.1278], size: 0.05 }, // London, UK
                { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo, Japan
                { location: [-33.8688, 151.2093], size: 0.04 }, // Sydney, Australia
            ],
            onRender: (state: any) => {
                // Auto-rotate the globe slowly
                state.phi = phi;
                phi += 0.002;
            }
        } as any); // ✅ 'as any' bypasses the TypeScript warning perfectly!

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#fafafa]">
            {/* The Canvas for the Globe */}
            <canvas
                ref={canvasRef}
                style={{ width: 800, height: 800, maxWidth: "100%", aspectRatio: 1 }}
                className="cursor-grab active:cursor-grabbing opacity-90 transition-opacity duration-1000"
            />
            
            {/* High-end Overlay UI over the Globe */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="bg-white/80 backdrop-blur-md border border-[#e5e5e5] px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-[#008a5e] rounded-full animate-pulse" />
                    <div>
                        <p className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-wider mb-0.5">Primary Node</p>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">Ahmedabad, IN</p>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-md border border-[#e5e5e5] px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <Server className="w-4 h-4 text-[#6b6b6b]" strokeWidth={1.5} />
                    <div>
                        <p className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-wider mb-0.5">Global Edge Network</p>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">5 Active Regions</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 right-6 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#333] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#008a5e]" />
                <span className="text-[13px] font-semibold">Store traffic live tracking</span>
            </div>
        </div>
    );
}

export default function OnlineStore() {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isLive, setIsLive] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [viewMode, setViewMode] = useState<'iframe' | 'globe'>('globe');
    const STORE_URL = 'https://dvsk-alpha.vercel.app/'; 

    const deviceWidths = {
        desktop: 'w-full',
        tablet: 'w-[768px]',
        mobile: 'w-[390px]',
    };

    const handleGoLive = async () => {
        setIsStarting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await fetch(`${API_URL}/api/start-store`, { method: 'POST' });

            setTimeout(() => {
                setIsLive(true);
                setIsStarting(false);
                setViewMode('iframe');
            }, 3500);

        } catch (error) {
            console.error("Failed to start server", error);
            setIsStarting(false);
            alert(`Could not connect to backend.`);
        }
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 pb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Online Store</h1>
                    <p className="text-[14px] text-[#6b6b6b] mt-1">Manage and preview your live storefront globally.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-[#f4f4f5] p-1 rounded-lg border border-[#e5e5e5]">
                        <button 
                            onClick={() => setViewMode('globe')}
                            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'globe' ? 'bg-white text-[#1a1a1a] shadow-sm border border-[#d1d5db]' : 'text-[#6b6b6b] hover:text-[#1a1a1a] border border-transparent'}`}
                        >
                            <GlobeIcon className="w-3.5 h-3.5" /> Network
                        </button>
                        <button 
                            onClick={() => setViewMode('iframe')}
                            className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'iframe' ? 'bg-white text-[#1a1a1a] shadow-sm border border-[#d1d5db]' : 'text-[#6b6b6b] hover:text-[#1a1a1a] border border-transparent'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                    </div>

                    <a
                        href={isLive ? STORE_URL : '#'}
                        target={isLive ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-2 border px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300
                            ${isLive
                                ? 'bg-white border-[#d1d5db] text-[#1a1a1a] hover:border-[#1a1a1a] hover:shadow-sm'
                                : 'bg-[#f4f4f5] border-transparent text-[#9a9a9a] cursor-not-allowed'}`}
                    >
                        <Eye className={`w-[15px] h-[15px] ${isLive ? 'text-[#6b6b6b] group-hover:text-[#1a1a1a]' : 'text-[#c4c4c4]'}`} strokeWidth={2} />
                        View live store
                    </a>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-8">

                {/* ── MASSIVE LIVE WINDOW ── */}
                <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300">

                    {/* Browser Chrome Bar */}
                    <div className="bg-[#f4f4f5] border-b border-[#e5e5e5] px-4 py-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89f24]" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#23a736]" />
                        </div>

                        <div className="flex-1 max-w-2xl bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm mx-auto transition-all">
                            {isLive ? (
                                <Lock className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" strokeWidth={2.5} />
                            ) : (
                                <Lock className="w-3.5 h-3.5 text-[#c4c4c4] flex-shrink-0" strokeWidth={2.5} />
                            )}
                            <span className={`text-[13px] truncate font-medium ${isLive ? 'text-[#1a1a1a]' : 'text-[#9a9a9a]'}`}>
                                {viewMode === 'globe' ? 'global.network.dvsk.com' : STORE_URL}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            {viewMode === 'iframe' && (
                                <>
                                    <button onClick={() => setDevice('desktop')} className={`p-2 rounded-lg transition-all ${device === 'desktop' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-[#6b6b6b] hover:bg-[#e4e4e7] hover:text-[#1a1a1a]'}`}>
                                        <Monitor className="w-[18px] h-[18px]" strokeWidth={2} />
                                    </button>
                                    <button onClick={() => setDevice('tablet')} className={`p-2 rounded-lg transition-all ${device === 'tablet' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-[#6b6b6b] hover:bg-[#e4e4e7] hover:text-[#1a1a1a]'}`}>
                                        <Tablet className="w-[18px] h-[18px]" strokeWidth={2} />
                                    </button>
                                    <button onClick={() => setDevice('mobile')} className={`p-2 rounded-lg transition-all ${device === 'mobile' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-[#6b6b6b] hover:bg-[#e4e4e7] hover:text-[#1a1a1a]'}`}>
                                        <Smartphone className="w-[18px] h-[18px]" strokeWidth={2} />
                                    </button>
                                    <div className="w-px h-6 bg-[#d1d5db] mx-2" />
                                </>
                            )}
                            
                            <button
                                onClick={() => {
                                    if (viewMode === 'iframe' && isLive) {
                                        const iframe = document.getElementById('store-preview') as HTMLIFrameElement;
                                        if (iframe) iframe.src = iframe.src;
                                    }
                                }}
                                className={`p-2 rounded-lg transition-all ${isLive || viewMode === 'globe' ? 'text-[#6b6b6b] hover:bg-[#e4e4e7] hover:text-[#1a1a1a]' : 'text-[#d1d5db] cursor-not-allowed'}`}
                            >
                                <RefreshCw className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Window Content Area */}
                    <div className="bg-gradient-to-b from-[#e5e7eb] to-[#d1d5db] p-6 flex justify-center overflow-hidden transition-all duration-500" style={{ height: '650px' }}>
                        
                        {viewMode === 'globe' ? (
                            // 🌍 THE STUNNING GLOBE VIEW
                            <div className="w-full h-full rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#e5e5e5] overflow-hidden">
                                <WorldGlobe />
                            </div>
                        ) : (
                            // 📱 THE IFRAME PREVIEW
                            <div className={`${deviceWidths[device]} h-full transition-all duration-500 ease-out overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-[#e5e5e5] bg-white flex items-center justify-center`}>
                                {isLive ? (
                                    <iframe
                                        id="store-preview"
                                        src={STORE_URL}
                                        title="Store Preview"
                                        className="w-full h-full border-0 bg-white"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Monitor className="w-16 h-16 text-[#c4c4c4] mx-auto mb-4" strokeWidth={1} />
                                        <h3 className="text-[#1a1a1a] font-semibold text-lg">Server is Offline</h3>
                                        <p className="text-[#6b6b6b] text-sm mt-1">Click "Go Live" to start the frontend server</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preview Footer Action Bar */}
                    <div className="bg-white border-t border-[#e5e5e5] px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isLive ? (
                                <span className="flex items-center gap-2 bg-[#ecfdf5] text-[#008a5e] px-2.5 py-1 rounded-md text-[12px] font-bold border border-[#a7f3d0] uppercase tracking-wider">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
                                    </span>
                                    Live
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 bg-[#f4f4f5] text-[#6b6b6b] px-2.5 py-1 rounded-md text-[12px] font-bold border border-[#e5e5e5] uppercase tracking-wider">
                                    <div className="w-2 h-2 rounded-full bg-[#9a9a9a]" />
                                    Offline
                                </span>
                            )}
                            <span className="text-[14px] font-bold text-[#1a1a1a]">
                                DVSK Frontend
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#f4f4f5] px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-[#e5e5e5]">
                                Actions <ChevronDown className="w-4 h-4 text-[#6b6b6b]" strokeWidth={2} />
                            </button>

                            {/* ✅ THE GO LIVE BUTTON */}
                            <button
                                onClick={handleGoLive}
                                disabled={isLive || isStarting}
                                className={`px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors flex items-center gap-2 shadow-sm duration-200
                                    ${isLive
                                        ? 'bg-[#ecfdf5] text-[#008a5e] border border-[#a7f3d0]'
                                        : 'bg-[#1a1a1a] text-white hover:bg-[#333] hover:-translate-y-0.5 active:translate-y-0'}`}
                            >
                                {isStarting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting Server...</>
                                ) : isLive ? (
                                    <><div className="w-2 h-2 rounded-full bg-[#008a5e] animate-pulse" /> Server Running</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Go Live</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Theme Library Section */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#e5e5e5] overflow-hidden">
                    <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center bg-[#fcfcfc]">
                        <div>
                            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Theme library</h2>
                            <p className="text-[13px] text-[#6b6b6b]">Manage and preview up to 20 themes</p>
                        </div>
                        <button className="text-[13px] font-semibold text-[#005bd3] hover:text-[#004299]">Add theme</button>
                    </div>

                    <div className="p-12 flex flex-col items-center justify-center text-center bg-[#fafafa]">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-[#e5e5e5] flex items-center justify-center mb-5">
                            <Zap className="w-7 h-7 text-[#fbbf24]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2">Build your dream storefront</h3>
                        <p className="text-[14px] text-[#6b6b6b] max-w-md mb-6">
                            Explore the Theme Store to find the perfect look for your brand, or securely upload a custom theme zip file.
                        </p>
                        <button className="bg-white border border-[#d1d5db] text-[#1a1a1a] px-6 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-[#f3f4f6] transition-all shadow-sm hover:shadow active:scale-[0.98]">
                            Explore themes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}