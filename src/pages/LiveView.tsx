import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, Clock, TrendingUp, Loader2, Activity, ChevronRight, CheckCircle2, Zap, Eye, ShoppingBag, UserPlus, UserMinus, Globe2, ListOrdered } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Socket } from 'socket.io-client';
import { connectLiveFeed } from '../lib/liveSocket';
import { orderService } from '../api/orderService';

type ActivityKind = 'join' | 'view' | 'cart' | 'leave';
interface ActivityItem {
  key: string;
  kind: ActivityKind;
  ip: string;
  path?: string;
  productName?: string;
  ts: number;
}

const formatTimeAgo = (ts: number): string => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

// ── Custom Glowing Radar Icon (Emerald Green) ──
const createGlowingIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="glowing-dot-wrapper">
        <div class="glowing-pulse"></div>
        <div class="glowing-dot"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// ── Map Controller ──
const MapController = ({ focusLocation }: { focusLocation: { lat: number; lng: number; zoom?: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (focusLocation) {
      map.flyTo([focusLocation.lat, focusLocation.lng], focusLocation.zoom || 12, {
        duration: 2,
        easeLinearity: 0.25,
      });
    }
  }, [focusLocation, map]);
  return null;
};

// ── EXPERT UI: FULLY ANIMATED LIVE VIEWERS HUD ──
const LiveViewersHUD = ({ count }: { count: number | null }) => {
  const viewers = count ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative group cursor-default">
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"
      />
      
      <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 p-1.5 pr-5 rounded-full flex items-center gap-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner overflow-hidden">
          <div className="absolute w-full h-full rounded-full border border-emerald-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
          <div className="absolute w-full h-full rounded-full border border-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_1s_infinite] opacity-30" />
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,1)]" />
        </div>

        <div className="flex flex-col justify-center pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <motion.span key={viewers} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[17px] font-bold text-white tracking-tight leading-none tabular-nums">
              {viewers.toLocaleString()}
            </motion.span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Live</span>
          </div>
          <span className="text-[10px] text-[#888] font-medium mt-0.5 tracking-wide">Active Shoppers</span>
        </div>

        <div className="flex items-end gap-0.5 h-4 ml-2 pl-4 border-l border-white/10">
          {[0.2, 0.4, 0.1, 0.3, 0.5].map((delay, i) => (
            <motion.div
              key={i} animate={{ height: ["30%", "100%", "30%"] }} transition={{ duration: 1, repeat: Infinity, delay: delay, ease: "easeInOut" }}
              className="w-[3px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function LiveView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 🔥 TRUE ZERO STATE: Waiting for backend connection
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [dispatchCount, setDispatchCount] = useState(0);
  const [activeShoppers, setActiveShoppers] = useState<number | null>(null);
  const [liveActivity, setLiveActivity] = useState<ActivityItem[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [viewMode, setViewMode] = useState<'stream' | 'locations'>('stream');
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const locationsByCity = React.useMemo(() => {
    const map = new Map<string, { city: string; count: number; total: number; lat: number; lng: number; lastTs: number }>();
    for (const o of liveOrders) {
      const key = (o.city || 'Unknown').toString();
      const existing = map.get(key);
      const amount = parseInt(String(o.amount).replace(/\D/g, '')) || 0;
      if (existing) {
        existing.count += 1;
        existing.total += amount;
        if (o.ts && o.ts > existing.lastTs) existing.lastTs = o.ts;
      } else {
        map.set(key, { city: key, count: 1, total: amount, lat: o.lat, lng: o.lng, lastTs: o.ts || Date.now() });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [liveOrders]);

  const focusOnLocation = (loc: { city: string; lat: number; lng: number }) => {
    setActiveLocation(loc.city);
    setActiveOrder(null);
    setFocusLocation({ lat: loc.lat, lng: loc.lng, zoom: 8 });
  };

  const handleIncomingOrder = useCallback((orderData: any) => {
    setLiveOrders(prev => [orderData, ...prev].slice(0, 20));
    setTotalVolume(prev => prev + parseInt(orderData.amount.replace(/\D/g,'')));
    setDispatchCount(prev => prev + 1);
    setActiveOrder(orderData.id);
    setFocusLocation({ lat: orderData.lat, lng: orderData.lng, zoom: 7 });
  }, []);

  // Hydrate volume + dispatch count + the order list itself from today's real orders
  // so the right-side panel and map markers survive a page refresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stats, feed] = await Promise.all([
          orderService.stats('Today'),
          orderService.liveFeed('Today', 20),
        ]);
        if (cancelled) return;
        setTotalVolume(Math.round(stats.totalRevenue));
        setDispatchCount(stats.totalOrders);
        if (Array.isArray(feed) && feed.length > 0) {
          setLiveOrders(feed);
        }
      } catch (err) {
        console.error('[LiveView] failed to hydrate', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pushActivity = useCallback((item: Omit<ActivityItem, 'key'>) => {
    setLiveActivity(prev => [
      { ...item, key: `${item.ts}-${item.ip}-${Math.random().toString(36).slice(2, 8)}` },
      ...prev,
    ].slice(0, 30));
  }, []);

  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const socket = await connectLiveFeed();
      if (cancelled) {
        socket.disconnect();
        return;
      }
      socketRef.current = socket;
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
      if (socket.connected) setSocketConnected(true);
      socket.on('order:placed', handleIncomingOrder);
      socket.on('viewers:count', (data: { count: number }) => setActiveShoppers(data.count));
      socket.on('visitors:snapshot', (list: Array<{ id: string; ip: string; path: string; joinedAt: number }>) => {
        if (Array.isArray(list) && list.length > 0) {
          setLiveActivity(prev => {
            const existingKeys = new Set(prev.map(p => `${p.ip}-${p.kind}`));
            const seeded: ActivityItem[] = list
              .filter(v => !existingKeys.has(`${v.ip}-join`))
              .map(v => ({
                key: `${v.joinedAt}-${v.ip}-${Math.random().toString(36).slice(2, 8)}`,
                kind: 'join',
                ip: v.ip,
                ts: v.joinedAt,
              }));
            return [...seeded, ...prev].slice(0, 30);
          });
        }
      });
      socket.on('visitor:join', (d: { ip: string; ts: number }) =>
        pushActivity({ kind: 'join', ip: d.ip, ts: d.ts }));
      socket.on('visitor:leave', (d: { ip: string; ts: number }) =>
        pushActivity({ kind: 'leave', ip: d.ip, ts: d.ts }));
      socket.on('page:view', (d: { ip: string; path: string; ts: number }) =>
        pushActivity({ kind: 'view', ip: d.ip, path: d.path, ts: d.ts }));
      socket.on('cart:add', (d: { ip: string; productName?: string; ts: number }) =>
        pushActivity({ kind: 'cart', ip: d.ip, productName: d.productName, ts: d.ts }));
    })();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [handleIncomingOrder, pushActivity]);

  const focusOnOrder = (order: typeof liveOrders[0]) => {
    setActiveOrder(order.id);
    setFocusLocation({ lat: order.lat, lng: order.lng, zoom: 12 });
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      setActiveOrder(null);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setFocusLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 11 });
        }
      } finally {
        setIsSearching(false);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-52px)] bg-[#050505] overflow-hidden flex font-sans text-[#ececec]">
      
      {/* ── MAP CONTAINER ── */}
      <div className="absolute inset-0 z-0 bg-[#050505] map-wrapper">
        <MapContainer 
          center={[22.5937, 78.9629]} zoom={5} // Starts showing all of India
          style={{ height: '100%', width: '100%', background: '#050505' }}
          zoomControl={false} attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <AnimatePresence>
            {liveOrders.map((order) => (
              <Marker key={order.id} position={[order.lat, order.lng]} icon={createGlowingIcon()} />
            ))}
          </AnimatePresence>
          <MapController focusLocation={focusLocation} />
        </MapContainer>
      </div>

      {/* Extreme Dark Mode Map Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

      {/* ── TOP LEFT CONTROLS ── */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        
        {/* Glass Search Bar */}
        <div className="w-[320px] relative group">
          <div className="absolute inset-0 bg-[#ffffff10] blur-xl rounded-full group-focus-within:bg-[#ffffff20] transition-all duration-500" />
          <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-full flex items-center px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {isSearching ? <Loader2 className="w-4 h-4 text-[#888] mr-3 animate-spin" /> : <Search className="w-4 h-4 text-[#888] mr-3" />}
            <input 
              type="text" placeholder="Search any city or zip code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
              className="bg-transparent border-none outline-none text-[14px] font-medium text-[#ececec] placeholder-[#666] w-full"
            />
          </div>
        </div>

        <LiveViewersHUD count={activeShoppers} />
      </div>

      {/* ── RIGHT GLASS SIDEBAR (Live Orders Feed) ── */}
      <div className="absolute right-0 top-0 bottom-0 w-[400px] z-20 p-6 flex flex-col pointer-events-none">
        <div className="flex-1 bg-[#0a0a0a]/60 backdrop-blur-3xl border border-[#ffffff10] rounded-3xl shadow-[-8px_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto relative">
          
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="px-6 py-6 border-b border-[#ffffff0a] relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <h2 className="text-[18px] font-semibold tracking-tight text-white">Live Operations</h2>
              </div>
              <p className="text-[13px] text-[#888] font-medium">Monitoring real-time transactions</p>
            </div>
            
          </div>

          <div className="grid grid-cols-2 gap-3 p-6 pb-2 relative z-10">
            <div className={`border rounded-2xl p-4 transition-colors duration-500 ${totalVolume > 0 ? 'bg-[#ffffff05] border-[#ffffff0a]' : 'bg-[#000] border-dashed border-[#ffffff20]'}`}>
              <TrendingUp className={`w-4 h-4 mb-2 transition-colors duration-500 ${totalVolume > 0 ? 'text-[#a855f7]' : 'text-[#444]'}`} />
              <p className="text-[11px] text-[#666] font-bold uppercase tracking-wider mb-1">Today's Volume</p>
              <motion.p key={totalVolume} initial={{ scale: 1.2, color: '#a855f7' }} animate={{ scale: 1, color: totalVolume > 0 ? '#fff' : '#666' }} className="text-[20px] font-semibold">
                ₹{totalVolume.toLocaleString()}
              </motion.p>
            </div>
            <div className={`border rounded-2xl p-4 transition-colors duration-500 ${dispatchCount > 0 ? 'bg-[#ffffff05] border-[#ffffff0a]' : 'bg-[#000] border-dashed border-[#ffffff20]'}`}>
              <Package className={`w-4 h-4 mb-2 transition-colors duration-500 ${dispatchCount > 0 ? 'text-[#3b82f6]' : 'text-[#444]'}`} />
              <p className="text-[11px] text-[#666] font-bold uppercase tracking-wider mb-1">Live Dispatches</p>
              <motion.p key={dispatchCount} initial={{ scale: 1.2, color: '#3b82f6' }} animate={{ scale: 1, color: dispatchCount > 0 ? '#fff' : '#666' }} className="text-[20px] font-semibold">
                {dispatchCount.toLocaleString()}
              </motion.p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 relative z-10 custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#555] tracking-widest uppercase flex items-center gap-2">
                {viewMode === 'stream' ? 'Incoming Stream' : 'Order Locations'}
              </h3>
              <div className="flex items-center bg-[#ffffff05] border border-[#ffffff10] rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('stream')}
                  title="Stream"
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${viewMode === 'stream' ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'text-[#666] hover:text-[#aaa]'}`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('locations')}
                  title="Locations"
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${viewMode === 'locations' ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'text-[#666] hover:text-[#aaa]'}`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {viewMode === 'locations' ? (
              locationsByCity.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  <Globe2 className="w-8 h-8 text-[#444] mb-3" />
                  <p className="text-[13px] font-bold text-[#888]">No order locations yet</p>
                  <p className="text-[11px] text-[#555] mt-1">Cities will light up here as orders arrive.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {locationsByCity.map((loc) => (
                      <motion.button
                        key={loc.city}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        onClick={() => focusOnLocation(loc)}
                        className={`w-full text-left bg-[#ffffff03] hover:bg-[#ffffff08] border ${activeLocation === loc.city ? 'border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.15)]' : 'border-[#ffffff0a]'} p-4 rounded-2xl transition-all duration-300 group`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="glowing-dot-wrapper shrink-0" style={{ width: 32, height: 32 }}>
                            <div className="glowing-pulse" style={{ width: 32, height: 32 }} />
                            <div className="glowing-dot" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-[14px] font-semibold text-white tracking-wide truncate">{loc.city}</p>
                              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
                                {loc.count} {loc.count === 1 ? 'order' : 'orders'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[12px] text-[#888] font-medium">₹{loc.total.toLocaleString('en-IN')}</span>
                              <span className="text-[#666] group-hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1">
                                Focus <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : liveOrders.length === 0 ? (
              liveActivity.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative w-12 h-12 flex items-center justify-center mb-4 opacity-50">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <p className="text-[13px] font-bold text-[#888]">{socketConnected ? 'Connected · No visitors yet' : 'Awaiting backend connection...'}</p>
                  <p className="text-[11px] text-[#555] mt-1">{socketConnected ? 'Visitor activity will stream here in real time.' : 'Trying to reach the live socket.'}</p>
                </motion.div>
              ) : (
                <div className="relative border-l-2 border-[#ffffff0a] ml-4 space-y-4">
                  <AnimatePresence>
                    {liveActivity.map((evt, i) => {
                      const palette =
                        evt.kind === 'join' ? { dot: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', accent: 'text-emerald-400', Icon: UserPlus, label: 'Visitor joined' }
                        : evt.kind === 'leave' ? { dot: 'bg-[#555]', accent: 'text-[#888]', Icon: UserMinus, label: 'Visitor left' }
                        : evt.kind === 'cart' ? { dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', accent: 'text-amber-300', Icon: ShoppingBag, label: 'Added to cart' }
                        : { dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]', accent: 'text-blue-300', Icon: Eye, label: 'Page view' };
                      const PaletteIcon = palette.Icon;
                      return (
                        <motion.div
                          key={evt.key}
                          initial={{ opacity: 0, x: 20, scale: 0.95, height: 0 }}
                          animate={{ opacity: 1, x: 0, scale: 1, height: 'auto' }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="relative pl-6"
                        >
                          <div className={`absolute -left-[7px] top-3.5 w-3 h-3 rounded-full border-4 border-[#0a0a0a] ${i === 0 ? palette.dot : 'bg-[#333]'}`} />
                          <div className="bg-[#ffffff03] hover:bg-[#ffffff08] border border-[#ffffff0a] p-3 rounded-2xl transition-colors duration-300">
                            <div className="flex items-start gap-3">
                              <div className={`w-7 h-7 rounded-full bg-[#ffffff05] border border-[#ffffff10] flex items-center justify-center shrink-0 ${palette.accent}`}>
                                <PaletteIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-white tracking-wide">
                                  {palette.label}
                                  {evt.kind === 'view' && evt.path && (
                                    <span className="ml-1.5 font-mono text-[11px] text-[#aaa]">{evt.path}</span>
                                  )}
                                  {evt.kind === 'cart' && evt.productName && (
                                    <span className="ml-1.5 text-[11px] text-[#aaa]">{evt.productName}</span>
                                  )}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-[#666] font-mono">{evt.ip}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-[#555]">
                                    <Clock className="w-2.5 h-2.5" /> {formatTimeAgo(evt.ts)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <div className="relative border-l-2 border-[#ffffff0a] ml-4 space-y-6">
                <AnimatePresence>
                  {liveOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 20, scale: 0.95, height: 0 }} 
                      animate={{ opacity: 1, x: 0, scale: 1, height: 'auto' }} 
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      onClick={() => focusOnOrder(order)}
                      className="relative pl-6 cursor-pointer group"
                    >
                      <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-[#0a0a0a] transition-colors duration-300 ${activeOrder === order.id ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : i === 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-[#444] group-hover:bg-[#888]'}`} />
                      
                      <div className={`bg-[#ffffff03] hover:bg-[#ffffff0a] border ${activeOrder === order.id ? 'border-[#ffffff40] shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-[#ffffff0a]'} p-4 rounded-2xl transition-all duration-300`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[14px] font-semibold text-white tracking-wide flex items-center gap-2">
                              {order.city} {i === 0 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">New</span>}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#666] font-medium mt-0.5">
                              <Clock className="w-3 h-3" /> Just now
                            </div>
                          </div>
                          <span className="text-[13px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
                            {order.amount}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#888] bg-[#00000040] rounded-lg px-3 py-2.5 flex items-center justify-between border border-[#ffffff05]">
                          <span className="font-mono text-[11px]">ORDER #{order.id}</span>
                          <span className="text-[#666] group-hover:text-white transition-colors font-medium flex items-center gap-1">Focus <ChevronRight className="w-3 h-3"/></span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        
        .leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-container { background: #050505 !important; }

        .glowing-dot-wrapper { position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
        .glowing-dot { width: 14px; height: 14px; background-color: #34d399; border-radius: 50%; box-shadow: 0 0 15px #34d399, 0 0 30px #34d399; border: 2px solid white; z-index: 2; }
        .glowing-pulse { position: absolute; width: 40px; height: 40px; background-color: rgba(52, 211, 153, 0.4); border-radius: 50%; animation: sonar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; z-index: 1; border: 1px solid #34d399; }

        @keyframes sonar-ping {
          0% { transform: scale(0.3); opacity: 1; }
          80%, 100% { transform: scale(2); opacity: 0; }
        }
      `}} />
    </div>
  );
}