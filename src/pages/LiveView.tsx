import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, Clock, TrendingUp, Loader2, Activity, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Dummy Data Pool (Used only for the Manual Simulate Button for now) ──
const CITY_POOL = [
  { city: 'Mumbai', lng: 72.8777, lat: 19.0760 },
  { city: 'Delhi', lng: 77.2090, lat: 28.6139 },
  { city: 'Bangalore', lng: 77.5946, lat: 12.9716 },
  { city: 'Hyderabad', lng: 78.4867, lat: 17.3850 },
  { city: 'Ahmedabad', lng: 72.5714, lat: 23.0225 },
  { city: 'Pune', lng: 72.8369, lat: 18.5204 },
  { city: 'Chennai', lng: 80.2707, lat: 13.0827 },
  { city: 'Kolkata', lng: 88.3639, lat: 22.5726 },
  { city: 'Surat', lng: 72.8311, lat: 21.1702 },
  { city: 'Jaipur', lng: 72.8128, lat: 26.9124 }
];

const generateOrder = (id: number) => {
  const loc = CITY_POOL[Math.floor(Math.random() * CITY_POOL.length)];
  return {
    id: `100${id}`,
    city: loc.city,
    amount: `₹${(Math.floor(Math.random() * 150) + 15) * 100}`,
    time: 'Just now',
    lng: loc.lng + (Math.random() * 0.05 - 0.025),
    lat: loc.lat + (Math.random() * 0.05 - 0.025),
  };
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
const LiveViewersHUD = () => {
  const [viewers, setViewers] = useState(124);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => Math.max(10, prev + (Math.floor(Math.random() * 9) - 4)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
  
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // ── THIS IS WHAT YOU WILL CALL FROM YOUR WEB SOCKET LATER ──
  const handleIncomingOrder = useCallback((orderData: any) => {
    setLiveOrders(prev => [orderData, ...prev].slice(0, 20)); // Prepend and keep last 20
    setTotalVolume(prev => prev + parseInt(orderData.amount.replace(/\D/g,'')));
    setDispatchCount(prev => prev + 1);
    
    // Auto focus map on new order
    setActiveOrder(orderData.id);
    setFocusLocation({ lat: orderData.lat, lng: orderData.lng, zoom: 7 });
  }, []);

  // For testing UI before backend is connected
  const triggerFakeOrder = () => {
    const fakeData = generateOrder(Math.floor(Math.random() * 1000) + dispatchCount);
    handleIncomingOrder(fakeData);
  };

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

        <LiveViewersHUD />
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
            
            {/* 🔥 INTERACTIVE SIMULATE BUTTON FOR TESTING */}
            <button 
              onClick={triggerFakeOrder}
              className="bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all group"
              title="Click to simulate an incoming order from Backend"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-pulse" />
              <span className="text-[11px] font-bold text-white whitespace-nowrap">Simulate Event</span>
            </button>
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
            <h3 className="text-[11px] font-bold text-[#555] tracking-widest uppercase mb-6 flex items-center gap-2">
              Incoming Stream
            </h3>
            
            {liveOrders.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-4 opacity-50">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[13px] font-bold text-[#888]">Awaiting backend connection...</p>
                <p className="text-[11px] text-[#555] mt-1">Waiting for the first live order.</p>
              </motion.div>
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