import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  MapPin, 
  Package, 
  Plus,
  ArrowRight,
  Clock,
  X,
  Truck,
  Store,
  Warehouse,
  ChevronDown,
  Check,
  Map as MapIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useMainWebsite } from '../hooks/useMainWebsite';

// ── Types & Demo Data ──
type TransferStatus = 'Draft' | 'In Transit' | 'Completed' | 'Cancelled';
type LocationType = 'Warehouse' | 'Retail' | 'Pop-up';

interface Location {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
}

interface Transfer {
  id: string;
  source: Location;
  destination: Location;
  itemCount: number;
  itemsName: string;
  status: TransferStatus;
  date: string;
  departureTimeMs?: number; 
}

const LOCATIONS: Location[] = [
  { id: 'LOC-1', name: 'Chicago Hub', type: 'Warehouse', lat: 41.8781, lng: -87.6298 },
  { id: 'LOC-2', name: 'LA Flagship', type: 'Retail', lat: 34.0522, lng: -118.2437 },
  { id: 'LOC-3', name: 'NYC Fulfillment', type: 'Warehouse', lat: 40.7128, lng: -74.0060 },
  { id: 'LOC-4', name: 'London Pop-up', type: 'Pop-up', lat: 51.5074, lng: -0.1278 },
];

const TRANSFERS_STORAGE_KEY = 'dvsk_transfers_v2';

// ── Real-World Physics Math ──
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateFlightTimeHours = (distanceKm: number) => distanceKm / 800; // 800km/h cargo speed

const formatFlightTime = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

// ── Icons ──
const createLocationIcon = (type: LocationType) => {
  let color = type === 'Warehouse' ? '#a855f7' : type === 'Retail' ? '#10b981' : '#f59e0b'; 
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; box-shadow: 0 0 15px ${color}; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// ── Moving Airplane Component with Persistence & Trail ──
const MovingAirplane = ({ route }: { route: Transfer }) => {
  const [progress, setProgress] = useState(0);

  const distanceKm = useMemo(() => calculateDistanceKm(route.source.lat, route.source.lng, route.destination.lat, route.destination.lng), [route]);
  const realFlightTimeHours = useMemo(() => calculateFlightTimeHours(distanceKm), [distanceKm]);
  const animationDurationMs = useMemo(() => realFlightTimeHours * 3600000, [realFlightTimeHours]);

  useEffect(() => {
    let frame: number;

    const animate = () => {
      if (!route.departureTimeMs) return;

      const elapsed = Date.now() - route.departureTimeMs;
      const currentProgress = elapsed / animationDurationMs;

      if (currentProgress >= 1) {
        setProgress(1); 
      } else {
        setProgress(Math.max(0, currentProgress));
        frame = requestAnimationFrame(animate); 
      }
    };

    if (route.status === 'In Transit') {
      frame = requestAnimationFrame(animate);
    } else if (route.status === 'Completed') {
      setProgress(1);
    }

    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [animationDurationMs, route.departureTimeMs, route.status]);

  // Calculate current exact location
  const lat = route.source.lat + (route.destination.lat - route.source.lat) * progress;
  const lng = route.source.lng + (route.destination.lng - route.source.lng) * progress;

  // Orient nose of plane perfectly
  const dy = route.destination.lat - route.source.lat;
  const dx = route.destination.lng - route.source.lng;
  const angle = Math.atan2(dx, dy) * (180 / Math.PI); 

  // PERFECTLY CENTERED ICON
  const planeIcon = L.divIcon({
    className: 'airplane-icon',
    html: `
      <svg style="transform: rotate(${angle}deg); transform-origin: center center; filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.6)); display: block;" viewBox="0 0 24 24" width="32" height="32" fill="#facc15" stroke="#ca8a04" stroke-width="1">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Dead center of the 32x32 SVG
  });

  return (
    <>
      {/* Ghost line for the future path */}
      <Polyline positions={[[route.source.lat, route.source.lng], [route.destination.lat, route.destination.lng]]} color="rgba(255,255,255,0.15)" weight={2} />
      
      {/* Solid Purple dashed line tracking BEHIND the plane */}
      {progress > 0 && (
        <Polyline positions={[[route.source.lat, route.source.lng], [lat, lng]]} color="#a855f7" weight={2} dashArray="5, 10" className="animated-polyline" />
      )}

      {/* The Aircraft */}
      <Marker position={[lat, lng]} icon={planeIcon} />
    </>
  );
};

// ── Main Component ──
export default function Transfers() {
  const { data: liveData } = useMainWebsite('/transfers');

  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    // Remove any stale demo data cached by older builds.
    try { localStorage.removeItem('logistics_transfers'); } catch {}
    try {
      const saved = localStorage.getItem(TRANSFERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    if (Array.isArray(liveData) && liveData.length > 0) {
      setTransfers(liveData as unknown as Transfer[]);
    }
  }, [liveData]);

  useEffect(() => {
    localStorage.setItem(TRANSFERS_STORAGE_KEY, JSON.stringify(transfers));
  }, [transfers]);

  const [showMap, setShowMap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [formData, setFormData] = useState({ source: LOCATIONS[0], destination: LOCATIONS[1], itemCount: '', itemsName: '' });

  const activeRoutes = transfers.filter(t => t.status === 'In Transit');

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'In Transit': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Draft': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.source.id === formData.destination.id) return toast.error("Source and Destination cannot be the same.");
    if (!formData.itemCount || !formData.itemsName) return toast.error("Please specify items and quantity.");

    const newTransfer: Transfer = {
      id: `TRF-${Math.floor(Math.random() * 900) + 2000}`,
      source: formData.source,
      destination: formData.destination,
      itemCount: parseInt(formData.itemCount),
      itemsName: formData.itemsName,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setTransfers([newTransfer, ...transfers]);
    setIsModalOpen(false);
    toast.success('Transfer Draft Created!');
  };

  const updateStatus = (e: React.MouseEvent, id: string, status: TransferStatus) => {
    e.stopPropagation();
    setTransfers(transfers.map(t => {
      if (t.id === id) {
        const update = { ...t, status };
        if (status === 'In Transit') update.departureTimeMs = Date.now();
        return update;
      }
      return t;
    }));
    toast.success(`Transfer marked as ${status}`);
  };

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col relative h-[calc(100vh-60px)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Inventory Transfers</h1>
            <p className="text-[14px] text-[#888] mt-1">Move and track stock between your warehouses and stores.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMap(true)} className="bg-[#1a1a1a] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
            <MapIcon className="w-4 h-4" /> Network Map
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Transfer
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-[#111111]">
        
        <AnimatePresence>
          {!showMap && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col p-6 overflow-y-auto custom-scrollbar z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><Truck className="w-4 h-4" /> In Transit</div><div className="text-[28px] font-bold text-white">{transfers.filter(t => t.status === 'In Transit').reduce((acc, curr) => acc + curr.itemCount, 0)} <span className="text-[14px] text-[#666] font-medium">units</span></div></div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><Store className="w-4 h-4" /> To Retail</div><div className="text-[28px] font-bold text-white">{transfers.filter(t => t.destination.type === 'Retail' && t.status !== 'Completed').length} <span className="text-[14px] text-[#666] font-medium">pending</span></div></div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><div className="flex items-center gap-2 text-[#888] text-[13px] font-bold uppercase tracking-wider mb-2"><Warehouse className="w-4 h-4" /> Locations</div><div className="text-[28px] font-bold text-white">{LOCATIONS.length} <span className="text-[14px] text-[#666] font-medium">active</span></div></div>
              </div>

              <div className="bg-[#161616] rounded-xl border border-white/5 flex-1 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
                  <h2 className="text-[15px] font-semibold text-white">Transfer History</h2>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 bg-[#161616] z-10 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase">Transfer ID</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase">Route</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase">Flight Time</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase">Status</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transfers.map((transfer) => {
                        const dist = calculateDistanceKm(transfer.source.lat, transfer.source.lng, transfer.destination.lat, transfer.destination.lng);
                        const timeStr = formatFlightTime(calculateFlightTimeHours(dist));
                        return (
                          <tr key={transfer.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-6 py-5"><div className="text-[14px] font-bold text-white">{transfer.id}</div><div className="text-[12px] text-[#888] mt-0.5">{transfer.date}</div></td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div><div className="text-[13px] font-semibold text-[#ececec]">{transfer.source.name}</div></div>
                                <ArrowRight className="w-4 h-4 text-[#666]" />
                                <div><div className="text-[13px] font-semibold text-white">{transfer.destination.name}</div></div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-[13px] font-medium text-[#888]"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {timeStr}</div></td>
                            <td className="px-6 py-5"><span className={`inline-flex px-3 py-1.5 rounded-md border text-[11px] font-bold uppercase ${getStatusColor(transfer.status)}`}>{transfer.status}</span></td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {transfer.status === 'Draft' && <button onClick={(e) => updateStatus(e, transfer.id, 'In Transit')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase">Dispatch</button>}
                                {transfer.status === 'In Transit' && <button onClick={(e) => updateStatus(e, transfer.id, 'Completed')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase">Receive</button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMap && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#050505] z-20 flex">
              <button onClick={() => setShowMap(false)} className="absolute top-6 left-6 z-30 bg-black/80 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-white/10 transition-colors shadow-2xl flex items-center gap-2 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>
              
              <div className="absolute top-6 right-6 bottom-6 w-[340px] bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5">
                  <h3 className="text-[15px] font-bold text-white flex items-center gap-2"><MapIcon className="w-4 h-4 text-purple-400"/> Active Routes</h3>
                  <p className="text-[12px] text-[#888] mt-1">Live shipments tracking enroute</p>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                  {activeRoutes.length === 0 ? <p className="text-[13px] text-[#666] text-center mt-10">No active shipments.</p> : activeRoutes.map(route => {
                    const dist = calculateDistanceKm(route.source.lat, route.source.lng, route.destination.lat, route.destination.lng);
                    const timeStr = formatFlightTime(calculateFlightTimeHours(dist));
                    return (
                      <div key={route.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[12px] font-bold text-white">{route.id}</span>
                          <span className="text-[11px] font-bold text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {timeStr} ETE</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] font-medium text-[#ececec]">
                          <span className="truncate">{route.source.name}</span><ArrowRight className="w-3 h-3 text-[#666] mx-2" /><span className="truncate">{route.destination.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute inset-0 z-0">
                <MapContainer center={[37.5, -55]} zoom={3} style={{ height: '100%', width: '100%', background: '#050505' }} zoomControl={false} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {LOCATIONS.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={createLocationIcon(loc.type)}>
                      <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip"><div className="text-[13px] font-bold">{loc.name}</div></Tooltip>
                    </Marker>
                  ))}
                  {activeRoutes.map(route => <MovingAirplane key={route.id} route={route} />)}
                </MapContainer>
              </div>
              <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-visible">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-[18px] font-bold text-white">Create Inventory Transfer</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateTransfer} className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-4 relative">
                  <div className="flex-1 relative">
                    <label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Origin</label>
                    <button type="button" onClick={() => { setIsSourceOpen(!isSourceOpen); setIsDestOpen(false); }} className="w-full flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none">
                      <span className="truncate">{formData.source.name}</span><ChevronDown className="w-4 h-4 text-[#666]" />
                    </button>
                    {isSourceOpen && (
                      <div className="absolute left-0 right-0 top-[100%] mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                        {LOCATIONS.map((loc) => <button key={loc.id} type="button" onClick={() => { setFormData({...formData, source: loc}); setIsSourceOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-[#ececec] hover:bg-white/5 transition-colors"><div className="flex flex-col items-start"><span className="font-semibold">{loc.name}</span><span className="text-[11px] text-[#888]">{loc.type}</span></div>{formData.source.id === loc.id && <Check className="w-4 h-4 text-purple-400" />}</button>)}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#666] mt-6" />
                  <div className="flex-1 relative">
                    <label className="block text-[12px] font-bold text-purple-400 mb-1.5 uppercase tracking-wider">Destination</label>
                    <button type="button" onClick={() => { setIsDestOpen(!isDestOpen); setIsSourceOpen(false); }} className="w-full flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-[14px] text-white outline-none">
                      <span className="truncate">{formData.destination.name}</span><ChevronDown className="w-4 h-4 text-[#666]" />
                    </button>
                    {isDestOpen && (
                      <div className="absolute left-0 right-0 top-[100%] mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                        {LOCATIONS.map((loc) => <button key={loc.id} type="button" onClick={() => { setFormData({...formData, destination: loc}); setIsDestOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-[#ececec] hover:bg-white/5 transition-colors"><div className="flex flex-col items-start"><span className="font-semibold">{loc.name}</span><span className="text-[11px] text-[#888]">{loc.type}</span></div>{formData.destination.id === loc.id && <Check className="w-4 h-4 text-purple-400" />}</button>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white/10" />
                <div className="grid grid-cols-[100px_1fr] gap-4">
                  <div><label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Qty</label><input type="number" min="1" required value={formData.itemCount} onChange={e => setFormData({...formData, itemCount: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none" placeholder="150" /></div>
                  <div><label className="block text-[12px] font-bold text-[#888] mb-1.5 uppercase tracking-wider">Item Description</label><input required value={formData.itemsName} onChange={e => setFormData({...formData, itemsName: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none" placeholder="e.g. Heavyweight Hoodies" /></div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#888] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">Create Draft Transfer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-container { background: #050505 !important; font-family: inherit; z-index: 0; }
        
        /* THE FIX IS HERE: No 'margin: 0 !important' allowed. Leaflet needs margins to center the icon! */
        .airplane-icon { background: transparent !important; border: none !important; }

        .leaflet-tooltip.custom-tooltip { background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(255,255,255,0.1); color: white; backdrop-filter: blur(8px); border-radius: 8px; padding: 6px 12px; }
        .leaflet-tooltip-top:before { border-top-color: rgba(10, 10, 10, 0.9); }
        
        .animated-polyline { stroke-dasharray: 5, 10; animation: dash-move 2s linear infinite; }
        @keyframes dash-move { to { stroke-dashoffset: -15; } }
      `}} />
    </div>
  );
}