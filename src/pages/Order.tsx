import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "../api/orderService";
import type { ApiOrder, OrderStatsSummary } from "../api/orderService";
import { motion } from "framer-motion";

// Helper to convert numbers to formatted ₹ string
const formatMoney = (val: string | number) => {
  const num = Number(val || 0);
  return isNaN(num) ? "₹0.00" : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface MappedOrder {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  total: string;
  payment: "Paid" | "Pending" | "Declined" | "Refunded";
  fulfillment: "Fulfilled" | "Unfulfilled" | "Returned";
  items: number;
}

type TimeFilter = "Today" | "Last 7 days" | "Last 30 days";

// ── Ultra-Smooth, Logic-Perfect Sparkline Component ──
const Sparkline = ({ data, color, gradientId }: { data: number[]; color: string; gradientId: string }) => {
  const isZero = !data || data.length === 0 || data.every(v => v === 0);
  
  // Explicitly typed as number[] 
  const safeData: number[] = isZero ? [0, 0, 0] : data;
  
  const height = 44;
  const width = 160;

  const max = Math.max(...safeData);
  const min = Math.min(...safeData);
  const range = max === min ? 10 : max - min; 

  // Explicitly type the points array to prevent 'never' inference on {x,y}
  let pointsArray: Array<{ x: number; y: number }> = safeData.map((d, i) => {
    const x = safeData.length === 1 ? (i === 0 ? 0 : width) : (i / (safeData.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  if (safeData.length === 1) {
    pointsArray.push({ x: width, y: pointsArray[0].y });
  }

  const controlPoint = (current: { x: number, y: number } | undefined, previous: { x: number, y: number } | undefined, next: { x: number, y: number } | undefined, reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    if (!p || !n || !current) return [current?.x || 0, current?.y || 0];
    const smoothing = isZero ? 0 : 0.2; 
    const angle = Math.atan2(n.y - p.y, n.x - p.x) + (reverse ? Math.PI : 0);
    const length = Math.sqrt(Math.pow(n.x - p.x, 2) + Math.pow(n.y - p.y, 2)) * smoothing;
    return [current.x + Math.cos(angle) * length, current.y + Math.sin(angle) * length];
  };

  const bezierCommand = (point: { x: number, y: number }, i: number, a: { x: number, y: number }[]) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
  };

  const pathD = pointsArray.reduce((acc, point, i, a) => 
    i === 0 ? `M ${point.x},${point.y}` : `${acc} ${bezierCommand(point, i, a)}`
  , "");

  const fillPathD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible mt-4">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isZero ? "0.1" : "0.4"} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <motion.path 
        initial={{ d: fillPathD }}
        animate={{ d: fillPathD }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        fill={`url(#${gradientId})`} 
      />
      
      <motion.path
        initial={{ d: pathD }}
        animate={{ d: pathD }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isZero ? 0.3 : 1} 
      />
    </svg>
  );
};

export default function Order() {
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [statsSummary, setStatsSummary] = useState<OrderStatsSummary | null>(null);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<TimeFilter>("Last 30 days");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiOrders = await orderService.list();

      const mapped: MappedOrder[] = apiOrders.map((o: ApiOrder) => {
        const paymentStatus = o.Payment?.status || "PENDING";
        let payment: MappedOrder["payment"];
        switch (paymentStatus) {
          case "SUCCESS": case "CAPTURED": payment = "Paid"; break;
          case "FAILED": payment = "Declined"; break;
          case "REFUNDED": payment = "Refunded"; break;
          default: payment = "Pending";
        }

        const orderStatus = o.status || "PENDING";
        let fulfillment: MappedOrder["fulfillment"];
        if (orderStatus === "DELIVERED" || orderStatus === "SHIPPED") {
          fulfillment = "Fulfilled";
        } else if (orderStatus === "RETURNED") {
          fulfillment = "Returned";
        } else {
          fulfillment = "Unfulfilled";
        }

        return {
          id: o.id,
          orderNumber: o.orderNumber ? `#${o.orderNumber}` : `#${o.id.slice(0, 6).toUpperCase()}`,
          date: new Date(o.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          customer: o.User?.name || o.User?.email || "Guest Customer",
          total: formatMoney(o.total),
          payment,
          fulfillment,
          items: o.items?.length || 0,
        };
      });
      setOrders(mapped);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await orderService.stats();
      setStatsSummary(stats);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const filteredOrders = orders.filter((order) =>
    `${order.customer} ${order.orderNumber} ${order.payment} ${order.fulfillment}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handlePaymentAction = async (id: string, action: "accept" | "decline") => {
    try {
      const newStatus = action === "accept" ? "PROCESSING" : "CANCELLED";
      await orderService.updateStatus(id, newStatus);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                payment: action === "accept" ? "Paid" : "Declined",
                fulfillment: action === "accept" ? "Fulfilled" : "Returned",
              }
            : order
        )
      );
      toast.success(action === "accept" ? "Order verified" : "Order declined");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // THE FIX IS HERE: `([] as number[])` tells TypeScript this is definitely a number array.
  const dailyCounts = statsSummary?.daily.map(d => d.count) || ([] as number[]);
  const dailyRevenue = statsSummary?.daily.map(d => d.revenue) || ([] as number[]);

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1200px] mx-auto text-[#ececec]">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Orders</h1>
          <p className="text-[14px] text-[#888] mt-1">Manage and track your recent sales.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-2">
          Export CSV <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── PREMIUM STATS BAR ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg mb-8 flex flex-col md:flex-row overflow-visible">
        
        {/* Date Filter Dropdown */}
        <div className="relative border-b md:border-b-0 md:border-r border-white/10 flex md:w-[180px] shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className="flex items-center justify-between w-full px-6 py-5 hover:bg-white/5 transition-colors focus:outline-none rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-[14px] font-medium text-[#ececec]">{selectedDateFilter}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#888]" />
          </button>

          {isDateDropdownOpen && (
            <div className="absolute top-[105%] left-4 w-[200px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
              {(["Today", "Last 7 days", "Last 30 days"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setSelectedDateFilter(filter); setIsDateDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${selectedDateFilter === filter ? 'bg-purple-500/10 text-purple-400' : 'text-[#ececec] hover:bg-white/5'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max w-full">
            
            <div className="px-6 py-5 border-r border-white/10 flex-1 min-w-[200px] relative group hover:bg-white/[0.02] transition-colors">
              <div className="text-[13px] font-medium text-[#888] mb-1">Total Orders</div>
              <div className="text-[28px] font-bold text-white tracking-tight">{statsSummary?.totalOrders || 0}</div>
              <Sparkline data={dailyCounts} color="#a855f7" gradientId="grad-orders" />
            </div>
            
            <div className="px-6 py-5 border-r border-white/10 flex-1 min-w-[200px] relative group hover:bg-white/[0.02] transition-colors">
              <div className="text-[13px] font-medium text-[#888] mb-1">Total Revenue</div>
              <div className="text-[28px] font-bold text-white tracking-tight">{formatMoney(statsSummary?.totalRevenue || 0)}</div>
              <Sparkline data={dailyRevenue} color="#34d399" gradientId="grad-revenue" />
            </div>
            
            <div className="px-6 py-5 flex-1 min-w-[200px] relative group hover:bg-white/[0.02] transition-colors md:rounded-r-2xl">
              <div className="text-[13px] font-medium text-[#888] mb-1">Active Days</div>
              <div className="text-[28px] font-bold text-white tracking-tight">{statsSummary?.daily.length || 0}</div>
              <Sparkline data={statsSummary?.daily.length ? Array(statsSummary.daily.length).fill(1) : ([] as number[])} color="#60a5fa" gradientId="grad-days" />
            </div>

          </div>
        </div>
      </div>

      {/* ── DATA TABLE AREA ── */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/10 gap-4">
          <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 w-full sm:max-w-[400px] focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
            <Search className="w-4 h-4 text-[#888] mr-2.5" />
            <input
              type="text"
              placeholder="Search orders, customers, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#666]"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-[#ececec] bg-[#1a1a1a] border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              <Filter className="w-4 h-4 text-[#888]" /> Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-3">
               <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
               <span className="text-[13px] text-[#888] font-medium">Syncing orders...</span>
             </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#666]" />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">No orders found</h3>
              <p className="text-[14px] text-[#888] max-w-[250px]">Adjust your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Fulfillment</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-white hover:text-purple-400 transition-colors">
                        {order.orderNumber}
                      </span>
                      <div className="text-[12px] text-[#888] mt-0.5">{order.items} item{order.items !== 1 ? 's' : ''}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-[14px] text-[#a0a0a0] font-medium">{order.date}</td>
                    
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-medium text-[#ececec]">{order.customer}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-[14px] font-semibold text-white text-right">{order.total}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.payment === "Paid" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-semibold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Paid
                          </div>
                        )}
                        {order.payment === "Pending" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[12px] font-semibold">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" /> Pending
                          </div>
                        )}
                        {order.payment === "Declined" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-semibold">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]" /> Declined
                          </div>
                        )}
                        {order.payment === "Refunded" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-500/10 border border-gray-500/20 text-gray-400 text-[12px] font-semibold">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Refunded
                          </div>
                        )}

                        {/* Hover Actions for Pending Orders */}
                        {order.payment === "Pending" && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity -ml-1">
                            <button onClick={(e) => { e.stopPropagation(); handlePaymentAction(order.id, "accept"); }} className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handlePaymentAction(order.id, "decline"); }} className="p-1 hover:bg-red-500/20 text-red-400 rounded-md transition-colors ml-0.5">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {order.fulfillment === "Fulfilled" ? (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#ececec] text-[12px] font-semibold">
                          Fulfilled
                        </span>
                      ) : order.fulfillment === "Unfulfilled" ? (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[12px] font-semibold">
                          Unfulfilled
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-semibold">
                          Returned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-[#888] hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
