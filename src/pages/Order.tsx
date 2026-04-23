import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService} from "../api/orderService";
import type { ApiOrder } from "../api/orderService";
import type { OrderStatsSummary } from "../api/orderService";

// Helper to convert numbers to formatted ₹ string
const formatMoney = (val: string | number) => {
  const num = Number(val || 0);
  return isNaN(num) ? "₹0.00" : `₹${num.toFixed(2)}`;
};

interface MappedOrder {
  id: string; // backend id
  orderNumber: string;
  date: string;
  customer: string;
  total: string;
  payment: "Paid" | "Pending" | "Declined" | "Refunded";
  fulfillment: "Fulfilled" | "Unfulfilled" | "Returned";
  items: number;
}

type TimeFilter = "Today" | "Last 7 days" | "Last 30 days";

// Dynamic Sparkline component that scales to actual data
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length === 0) {
    return <div className="mt-2 text-[10px] text-[#a0a0a0]">No data</div>;
  }
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 80;

  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible mt-2">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Order() {
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Stats State
  const [statsSummary, setStatsSummary] = useState<OrderStatsSummary | null>(null);
  
  // Date Dropdown State
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<TimeFilter>("Last 30 days");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load real orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiOrders = await orderService.list();

      const mapped: MappedOrder[] = apiOrders.map((o: ApiOrder) => {
        const paymentStatus = o.Payment?.status || "PENDING";
        let payment: MappedOrder["payment"];
        switch (paymentStatus) {
          case "SUCCESS":
          case "CAPTURED":
            payment = "Paid";
            break;
          case "FAILED":
            payment = "Declined";
            break;
          case "REFUNDED":
            payment = "Refunded";
            break;
          case "PENDING":
          default:
            payment = "Pending";
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
          orderNumber: o.orderNumber ? `#${o.orderNumber}` : `#${o.id.slice(0, 6)}`,
          date: new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
          customer: o.User?.name || o.User?.email || "Guest Customer",
          total: formatMoney(o.total),
          payment,
          fulfillment,
          items: o.items?.length || 0,
        };
      });

      setOrders(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Load dynamic stats from backend
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

      toast.success(action === "accept" ? "Order accepted" : "Order declined");
    } catch (error) {
      console.error(error);
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

  // Compute graph data arrays from real stats
  const dailyCounts = statsSummary?.daily.map(d => d.count) || [];
  const dailyRevenue = statsSummary?.daily.map(d => d.revenue) || [];

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#1a1a1a]">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 12h2M11 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">Orders</h1>
          </div>
        </div>

        {/* Dynamic Stats Bar */}
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm mb-6 flex items-stretch overflow-visible">
          <div className="relative border-r border-[#f0f0f0] flex" ref={dropdownRef}>
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-5 py-3.5 hover:bg-[#f9f9f9] transition-colors h-full min-w-[120px] text-left focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-[#6b6b6b]" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">{selectedDateFilter}</span>
            </button>

            {isDateDropdownOpen && (
              <div className="absolute top-[105%] left-2 w-[200px] bg-white border border-[#e8e8e8] rounded-xl shadow-lg py-1.5 z-50">
                {(["Today", "Last 7 days", "Last 30 days"] as TimeFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedDateFilter(filter);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#f9f9f9] text-[#1a1a1a]"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-x-auto no-scrollbar">
            <div className="flex min-w-max">
              <div className="px-6 py-4 border-r border-[#f0f0f0] min-w-[180px]">
                <div className="text-[12px] text-[#6b6b6b] border-b border-dashed border-[#e8e8e8] pb-1 inline-block mb-1">
                  Orders
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-bold text-[#1a1a1a]">{statsSummary?.totalOrders || 0}</span>
                </div>
                <Sparkline data={dailyCounts} color="#5C8B82" />
              </div>
              <div className="px-6 py-4 border-r border-[#f0f0f0] min-w-[180px]">
                <div className="text-[12px] text-[#6b6b6b] border-b border-dashed border-[#e8e8e8] pb-1 inline-block mb-1">
                  Total Revenue
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-bold text-[#1a1a1a]">{formatMoney(statsSummary?.totalRevenue || 0)}</span>
                </div>
                <Sparkline data={dailyRevenue} color="#5C8B82" />
              </div>
              <div className="px-6 py-4 border-r border-[#f0f0f0] min-w-[180px]">
                <div className="text-[12px] text-[#6b6b6b] border-b border-dashed border-[#e8e8e8] pb-1 inline-block mb-1">
                  Active Days
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-bold text-[#1a1a1a]">{statsSummary?.daily.length || 0}</span>
                </div>
                {/* Flat line for constant metric */}
                <Sparkline data={[1,1,1]} color="#D98A7A" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table Area */}
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-[#e8e8e8]">
            <div className="flex items-center gap-2 flex-1 max-w-[600px]">
              <div className="flex items-center bg-[#fdfdfd] border border-[#e8e8e8] rounded-md px-3 py-1.5 flex-1 focus-within:border-[#1a1a1a] transition-colors">
                <Search className="w-4 h-4 text-[#9b9b9b] mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Filter orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] text-[#1a1a1a] w-full placeholder:text-[#9b9b9b]"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#1a1a1a] bg-white border border-[#e8e8e8] rounded-md hover:bg-[#f9f9f9] transition-colors shadow-sm">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
             <div className="py-24 flex justify-center text-[13px] text-[#6b6b6b]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#f9f9f9] flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-[#a0a0a0]" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">No orders found</h3>
              <p className="text-[13px] text-[#6b6b6b] max-w-[250px]">
                Try changing your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e8e8e8]">
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[12%]">Order</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[18%]">Date</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[20%]">Customer</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] text-right w-[15%]">Total</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[15%]">Payment</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[15%]">Fulfillment</th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[#6b6b6b] w-[5%]">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#e8e8e8] hover:bg-[#fcfcfc] transition-colors group cursor-pointer">
                      <td className="px-5 py-3">
                        <span className="text-[13px] font-semibold text-[#1a1a1a] hover:underline">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-[#6b6b6b]">{order.date}</td>
                      <td className="px-5 py-3 text-[13px] text-[#1a1a1a]">{order.customer}</td>
                      <td className="px-5 py-3 text-[13px] text-[#1a1a1a] text-right">{order.total}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {order.payment === "Pending" ? (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-[#fff8e6] text-[#b38a00] border border-[#ffeeba]">
                                Pending
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity ml-1">
                                <button onClick={(e) => { e.stopPropagation(); handlePaymentAction(order.id, "accept"); }} className="p-0.5 hover:bg-green-50 text-green-600 rounded">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handlePaymentAction(order.id, "decline"); }} className="p-0.5 hover:bg-red-50 text-red-600 rounded ml-0.5">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${order.payment === "Paid" ? "bg-[#f4fbf7] text-[#1e7e4c] border-[#d1f0e0]" : "bg-[#fdf3f4] text-[#c93b3b] border-[#fad5d9]"}`}>
                              {order.payment}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${order.fulfillment === "Fulfilled" ? "bg-[#f5f5f5] text-[#4a4a4a] border-[#e0e0e0]" : "bg-[#fff8e6] text-[#b38a00] border-[#ffeeba]"}`}>
                          {order.fulfillment}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-[#6b6b6b]">{order.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}