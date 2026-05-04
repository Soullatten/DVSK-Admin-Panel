import React, { useState, useEffect } from 'react';
import {
  FileText,
  MapPin,
  Package,
  CheckCircle2,
  Calendar,
  X,
  ArrowLeft,
  Plus,
  Trash2,
  Truck,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import {
  purchaseOrderService,
  geocodeCity,
  type ApiPurchaseOrder,
  type POStatus,
} from '../api/purchaseOrderService';
import { useAdminDataRefresh } from '../lib/useAdminDataRefresh';

// ── Types ──
type OrderStatus = 'Processing' | 'In Transit' | 'Customs' | 'Delivered' | 'Cancelled';

interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  city: string;
  country: string;
  amount: string;
  status: OrderStatus;
  eta: string;
  items: string;
  lat: number;
  lng: number;
  progress: number;
}

const STATUS_FROM_API: Record<POStatus, OrderStatus> = {
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  CUSTOMS: 'Customs',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const NEXT_STATUS_API: Record<POStatus, POStatus | null> = {
  PROCESSING: 'IN_TRANSIT',
  IN_TRANSIT: 'CUSTOMS',
  CUSTOMS: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
};

const STATUS_TO_API: Record<OrderStatus, POStatus> = {
  Processing: 'PROCESSING',
  'In Transit': 'IN_TRANSIT',
  Customs: 'CUSTOMS',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
};

const fmtAmount = (amt: string | number, currency: string = 'INR') => {
  const n = Number(amt) || 0;
  if (currency === 'USD') return `$${n.toLocaleString('en-US')}`;
  if (currency === 'EUR') return `€${n.toLocaleString('en-DE')}`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return 'TBD';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return 'TBD';
  }
};

const apiToView = (p: ApiPurchaseOrder): SupplierOrder => ({
  id: p.id,
  orderNumber: p.orderNumber,
  supplier: p.supplier,
  city: p.city,
  country: p.country,
  amount: fmtAmount(p.amount, p.currency),
  status: STATUS_FROM_API[p.status],
  eta: fmtDate(p.eta),
  items: p.itemsLabel,
  lat: typeof p.lat === 'number' ? p.lat : 20,
  lng: typeof p.lng === 'number' ? p.lng : 0,
  progress: p.progress,
});

// ── Custom Glowing Marker ──
const createGlowingIcon = (status: OrderStatus) => {
  const color = status === 'Delivered' ? '#10b981' : status === 'Customs' ? '#f59e0b' : '#a855f7';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 18px; 
        height: 18px; 
        background-color: ${color}; 
        border-radius: 50%; 
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color}; 
        border: 2px solid white;
        animation: pulse-marker 2s infinite;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// ── Map Controller ──
const MapController = ({ focusLocation }: { focusLocation: { lat: number; lng: number; zoom?: number } | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (focusLocation) {
      map.flyTo([focusLocation.lat, focusLocation.lng], focusLocation.zoom || 11, {
        duration: 1.8,
        easeLinearity: 0.25,
      });
    }
  }, [focusLocation, map]);
  return null;
};

// ── Main Component ──
export default function PurchaseOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeOrder, setActiveOrder] = useState<SupplierOrder | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '', city: '', country: '', amount: '', items: '', eta: ''
  });

  const refresh = async () => {
    try {
      const list = await purchaseOrderService.list();
      setOrders(list.map(apiToView));
    } catch (err: any) {
      console.error('[PurchaseOrders] failed to load:', err);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useAdminDataRefresh('purchase-orders', refresh);

  // ── Handlers ──
  const handleOrderClick = (order: SupplierOrder) => {
    setActiveOrder(order);
    setTimeout(() => {
      setFocusLocation({ lat: order.lat, lng: order.lng, zoom: 6 });
    }, 100);
  };

  const closeMap = () => {
    setActiveOrder(null);
    setFocusLocation(null);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier || !formData.city) {
      toast.error('Supplier and City are required');
      return;
    }

    setCreating(true);
    try {
      const coords = await geocodeCity(formData.city, formData.country);
      const created = await purchaseOrderService.create({
        supplier: formData.supplier,
        city: formData.city,
        country: formData.country || 'Unknown',
        amount: Number(formData.amount) || 0,
        currency: 'INR',
        itemsLabel: formData.items || 'Standard Freight',
        eta: formData.eta || undefined,
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      });
      if (created) {
        setOrders(prev => [apiToView(created), ...prev]);
        setIsModalOpen(false);
        setFormData({ supplier: '', city: '', country: '', amount: '', items: '', eta: '' });
        toast.success('Purchase Order Created!');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create purchase order';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const advanceOrderStatus = async () => {
    if (!activeOrder) return;
    const currentApi = STATUS_TO_API[activeOrder.status];
    const nextApi = NEXT_STATUS_API[currentApi];
    if (!nextApi) {
      toast('Order is already delivered!', { icon: '✅' });
      return;
    }
    try {
      const updated = await purchaseOrderService.updateStatus(activeOrder.id, nextApi);
      if (updated) {
        const view = apiToView(updated);
        setOrders(prev => prev.map(o => (o.id === view.id ? view : o)));
        setActiveOrder(view);
        if (view.status === 'Delivered') {
          toast.success('Delivered · Stock auto-updated on inventory');
        } else {
          toast.success(`Status updated to ${view.status}`);
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update status';
      toast.error(msg);
    }
  };

  const deleteOrder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await purchaseOrderService.remove(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      if (activeOrder?.id === id) closeMap();
      toast.success('Order deleted');
    } catch (err: any) {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'In Transit': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Customs': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-full font-sans text-[#ececec] p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-60px)] relative">
      
      {/* ── GLOBAL HEADER ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Purchase Orders</h1>
            <p className="text-[14px] text-[#888] mt-1">Track inbound inventory and supplier shipments.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create PO
        </button>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="relative flex-1 min-h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-[#111111]">
        
        {/* VIEW 1: DATA TABLE */}
        <AnimatePresence>
          {!activeOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col z-10"
            >
              <div className="p-5 border-b border-white/10 bg-[#161616] flex items-center justify-between shrink-0">
                <h2 className="text-[15px] font-semibold text-white">Active Shipments</h2>
                <span className="text-[12px] font-medium px-2.5 py-1 bg-white/10 rounded-md text-[#888]">{orders.length} Orders</span>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#888]">
                    <Loader2 className="w-8 h-8 mb-4 animate-spin text-purple-400" />
                    <p>Loading purchase orders…</p>
                  </div>
                ) : orders.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-[#888]">
                     <Package className="w-12 h-12 mb-4 opacity-50" />
                     <p>No active purchase orders.</p>
                   </div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 bg-[#161616] z-10 shadow-sm border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Supplier & ID</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider">Origin</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-[#666] uppercase tracking-wider w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => (
                        <tr 
                          key={order.id} 
                          onClick={() => handleOrderClick(order)}
                          className="cursor-pointer hover:bg-white/[0.03] transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-white/20" />
                              <div>
                                <div className="text-[15px] font-bold text-white">{order.supplier}</div>
                                <div className="text-[13px] text-[#888] font-mono mt-0.5">{order.orderNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1.5 rounded-md border text-[11px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-[14px] font-medium text-[#ececec]">{order.city}</div>
                            <div className="text-[12px] text-[#666]">{order.country}</div>
                          </td>
                          <td className="px-6 py-5 text-[15px] font-bold text-white text-right">
                            {order.amount}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={(e) => deleteOrder(e, order.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 2: FULLSCREEN MAP & HUD */}
        <AnimatePresence>
          {activeOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#050505] z-20 flex"
            >
              
              {/* Back Button Overlay */}
              <button 
                onClick={closeMap}
                className="absolute top-6 left-6 z-30 bg-black/80 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-white/10 transition-colors shadow-2xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Orders
              </button>

              {/* Map Layer */}
              <div className="absolute inset-0 z-0">
                <MapContainer 
                  center={[20, 0]} 
                  zoom={2} 
                  style={{ height: '100%', width: '100%', background: '#050505' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[activeOrder.lat, activeOrder.lng]} icon={createGlowingIcon(activeOrder.status)} />
                  <MapController focusLocation={focusLocation} />
                </MapContainer>
              </div>

              {/* Vignette Overlay */}
              <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

              {/* Glass HUD Overlay */}
              <div className="absolute top-6 right-6 bottom-6 w-[360px] bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-20 pointer-events-auto overflow-hidden">
                
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  {/* HUD Header */}
                  <div className="flex items-start justify-between mb-6 shrink-0">
                    <div>
                      <div className="text-[11px] font-bold text-purple-400 tracking-widest uppercase mb-1">Live Tracking</div>
                      <h3 className="text-[20px] font-bold text-white leading-tight">{activeOrder.supplier}</h3>
                      <p className="text-[13px] text-[#888] font-mono mt-1">{activeOrder.orderNumber}</p>
                    </div>
                    <button onClick={closeMap} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[#888] transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                      <MapPin className="w-4 h-4 text-[#666] mb-2" />
                      <div className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Origin</div>
                      <div className="text-[14px] font-semibold text-white mt-1">{activeOrder.city}</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                      <Calendar className="w-4 h-4 text-[#666] mb-2" />
                      <div className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Est. Arrival</div>
                      <div className="text-[14px] font-semibold text-white mt-1">{activeOrder.eta}</div>
                    </div>
                  </div>

                  {/* Cargo Details */}
                  <div className="bg-[#161616] border border-white/5 rounded-xl p-5 mb-6 shadow-inner shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[14px] font-medium text-white">
                        <Package className="w-4 h-4 text-[#888]" /> Cargo Value
                      </div>
                      <span className="text-[16px] font-bold text-emerald-400">{activeOrder.amount}</span>
                    </div>
                    <div className="text-[13px] text-[#888] pl-6 border-l-2 border-white/10 ml-2">
                      {activeOrder.items}
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Transit Progress</span>
                      <span className="text-[14px] font-bold text-white">{activeOrder.progress}%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activeOrder.progress}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className={`h-full rounded-full ${
                          activeOrder.progress === 100 ? 'bg-emerald-400' : 'bg-purple-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="flex gap-4 items-start">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">Order Confirmed</p>
                          <p className="text-[12px] text-[#666] mt-0.5">Supplier accepted PO</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${activeOrder.progress >= 45 ? 'bg-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]' : 'bg-white/10'}`}>
                          {activeOrder.progress >= 45 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-[#666]" />}
                        </div>
                        <div>
                          <p className={`text-[13px] font-medium ${activeOrder.progress >= 45 ? 'text-white' : 'text-[#888]'}`}>Departed Origin</p>
                          <p className="text-[12px] text-[#666] mt-0.5">Left {activeOrder.city}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${activeOrder.progress >= 85 ? 'bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-white/10'}`}>
                          {activeOrder.progress >= 85 ? <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" /> : <div className="w-2 h-2 rounded-full bg-[#666]" />}
                        </div>
                        <div>
                          <p className={`text-[13px] font-medium ${activeOrder.progress >= 85 ? 'text-white' : 'text-[#888]'}`}>Customs Clearance</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${activeOrder.progress === 100 ? 'bg-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]' : 'bg-white/10'}`}>
                          {activeOrder.progress === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-[#666]" />}
                        </div>
                        <div>
                          <p className={`text-[13px] font-medium ${activeOrder.progress === 100 ? 'text-white' : 'text-[#888]'}`}>Delivered to Warehouse</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HUD Action Footer */}
                <div className="p-5 bg-white/5 border-t border-white/10 shrink-0">
                  <button 
                    onClick={advanceOrderStatus}
                    disabled={activeOrder.progress === 100}
                    className={`w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
                      activeOrder.progress === 100 
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    }`}
                  >
                    {activeOrder.progress === 100 ? <><CheckCircle2 className="w-4 h-4"/> Shipment Complete</> : <><Truck className="w-4 h-4" /> Advance Status</>}
                  </button>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── CREATE PO MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-[18px] font-bold text-white">Create Purchase Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePO} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Supplier Name</label>
                <input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="e.g. Acme Textiles" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">City</label>
                  <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="e.g. Shenzhen" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Country</label>
                  <input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="e.g. China" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Amount ($)</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">ETA Date</label>
                  <input type="date" required value={formData.eta} onChange={e => setFormData({...formData, eta: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-[#888] outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#888] mb-1.5 uppercase tracking-wider">Cargo Items</label>
                <input required value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white outline-none focus:border-purple-500/50" placeholder="e.g. 1000x Black Hoodies" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#ececec] hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={creating} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl text-[13px] font-medium shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-container { background: #050505 !important; font-family: inherit; z-index: 0;}
        @keyframes pulse-marker {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 currentcolor; }
          70% { transform: scale(1); box-shadow: 0 0 0 12px transparent; }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 transparent; }
        }
      `}} />
    </div>
  );
}