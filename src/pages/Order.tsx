import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "../api/orderService";
import type { ApiOrder } from "../api/orderService";

interface Order {
  id: string; // backend id
  orderNumber: string;
  date: string;
  customer: string;
  total: string;
  payment: "Paid" | "Pending" | "Declined" | "Refunded";
  fulfillment: "Fulfilled" | "Unfulfilled" | "Returned";
  items: number;
}

// Data organized by time periods (still demo – you can wire later)
const statsData = {
  Today: [
    {
      label: "Orders",
      value: "2",
      trend: "↑ 50%",
      data: [0, 1, 0, 0, 1, 0, 2],
      isNegative: false,
    },
    {
      label: "Items ordered",
      value: "4",
      trend: "↑ 10%",
      data: [0, 2, 0, 0, 1, 0, 4],
      isNegative: false,
    },
    {
      label: "Returns",
      value: "₹0",
      trend: "—",
      info: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      isNegative: true,
    },
    {
      label: "Orders fulfilled",
      value: "0",
      trend: "↓ 100%",
      data: [0, 0, 0, 0, 0, 0, 0],
      isNegative: false,
    },
    {
      label: "Orders delivered",
      value: "0",
      trend: "—",
      data: [0, 0, 0, 0, 0, 0, 0],
      isNegative: false,
    },
  ],
  "Last 7 days": [
    {
      label: "Orders",
      value: "15",
      trend: "↑ 12%",
      data: [1, 3, 2, 5, 2, 0, 2],
      isNegative: false,
    },
    {
      label: "Items ordered",
      value: "45",
      trend: "↑ 8%",
      data: [2, 8, 5, 12, 5, 0, 4],
      isNegative: false,
    },
    {
      label: "Returns",
      value: "₹5,600",
      trend: "↓ 2%",
      info: true,
      data: [0, 0, 0, 5600, 0, 0, 0],
      isNegative: true,
    },
    {
      label: "Orders fulfilled",
      value: "12",
      trend: "↑ 5%",
      data: [1, 2, 2, 4, 3, 0, 0],
      isNegative: false,
    },
    {
      label: "Orders delivered",
      value: "10",
      trend: "↑ 15%",
      data: [1, 1, 3, 3, 2, 0, 0],
      isNegative: false,
    },
  ],
  "Last 30 days": [
    {
      label: "Orders",
      value: "84",
      trend: "↑ 24%",
      data: [12, 15, 10, 22, 18, 25, 15],
      isNegative: false,
    },
    {
      label: "Items ordered",
      value: "216",
      trend: "↑ 31%",
      data: [25, 40, 30, 55, 45, 60, 45],
      isNegative: false,
    },
    {
      label: "Returns",
      value: "₹12,400",
      trend: "↑ 5%",
      info: true,
      data: [1200, 0, 3400, 2200, 0, 5600, 0],
      isNegative: true,
    },
    {
      label: "Orders fulfilled",
      value: "78",
      trend: "↑ 20%",
      data: [10, 14, 10, 20, 18, 23, 12],
      isNegative: false,
    },
    {
      label: "Orders delivered",
      value: "75",
      trend: "↑ 22%",
      data: [10, 12, 10, 18, 16, 22, 10],
      isNegative: false,
    },
  ],
};

type TimeFilter = "Today" | "Last 7 days" | "Last 30 days";

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
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

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Date Dropdown State
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<TimeFilter>("Today");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Stats pagination
  const currentStats = statsData[selectedDateFilter];
  const [statPage, setStatPage] = useState(0);
  const visibleStats = currentStats.slice(statPage * 4, statPage * 4 + 4);
  const canGoBack = statPage > 0;
  const canGoForward = (statPage + 1) * 4 < currentStats.length;

  // Load real orders from admin backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const apiOrders = await orderService.list();

        const mapped: Order[] = apiOrders.map((o: ApiOrder) => {
          const paymentStatus = o.Payment?.status || "PENDING";
          let payment: Order["payment"];
          switch (paymentStatus) {
            case "SUCCESS":
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
          let fulfillment: Order["fulfillment"];
          if (orderStatus === "DELIVERED" || orderStatus === "SHIPPED") {
            fulfillment = "Fulfilled";
          } else if (orderStatus === "RETURNED") {
            fulfillment = "Returned";
          } else {
            fulfillment = "Unfulfilled";
          }

          const totalNumber = Number(o.total);

          return {
            id: o.id,
            orderNumber: o.orderNumber
              ? `#${o.orderNumber}`
              : `#${o.id.slice(0, 6)}`,
            date: new Date(o.createdAt).toLocaleString(),
            customer:
              o.User?.name || o.User?.email || "Customer",
            total: `₹${isNaN(totalNumber) ? "0" : totalNumber.toFixed(2)}`,
            payment,
            fulfillment,
            items: o.items?.length || 0,
          };
        });

        setOrders(mapped);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load orders");
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    `${order.customer} ${order.orderNumber} ${order.payment}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handlePaymentAction = async (
    id: string,
    action: "accept" | "decline"
  ) => {
    try {
      const newStatus = action === "accept" ? "PROCESSING" : "CANCELLED";
      await orderService.updateStatus(id, newStatus);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                payment: action === "accept" ? "Paid" : "Declined",
                fulfillment:
                  action === "accept" ? "Fulfilled" : "Returned",
              }
            : order
        )
      );

      toast.success("Order updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-5 h-5 text-[#1a1a1a]"
            >
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 8h14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 12h2M11 12h2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight">
              Orders
            </h1>
          </div>
          <button
            onClick={() => toast.success("Action clicked!")}
            className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition-all shadow-sm"
          >
            Create order
          </button>
        </div>

        {/* Stats Bar with Dropdown */}
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm mb-6 flex items-stretch overflow-visible">
          <div
            className="relative border-r border-[#f0f0f0] flex"
            ref={dropdownRef}
          >
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-5 py-3.5 hover:bg-[#f9f9f9] transition-colors h-full min-w-[120px] text-left focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-[#6b6b6b]" />
              <span className="text-[13px] font-semibold text-[#1a1a1a]">
                {selectedDateFilter}
              </span>
            </button>

            {isDateDropdownOpen && (
              <div className="absolute top-[105%] left-2 w-[300px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e3e3e3] p-1 z-50">
                {[
                  {
                    label: "Today",
                    desc: "Compared to yesterday up to current hour",
                  },
                  {
                    label: "Last 7 days",
                    desc: "Compared to the previous 7 days",
                  },
                  {
                    label: "Last 30 days",
                    desc: "Compared to the previous 30 days",
                  },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => {
                      setSelectedDateFilter(option.label as TimeFilter);
                      setStatPage(0);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-[#f5f5f5] rounded-lg transition-colors text-left group"
                  >
                    <div className="pt-[3px]">
                      <div
                        className={`w-[14px] h-[14px] rounded-full border-[4px] 
                        ${
                          selectedDateFilter === option.label
                            ? "border-[#1a1a1a]"
                            : "border-[#d4d4d4] group-hover:border-[#a3a3a3]"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-[#1a1a1a] mb-0.5">
                        {option.label}
                      </span>
                      <span className="text-[12px] text-[#6b6b6b]">
                        {option.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Stats Cards */}
          <div className="flex flex-1 overflow-hidden">
            {visibleStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex-1 px-5 py-3 ${
                  i < visibleStats.length - 1
                    ? "border-r border-[#f0f0f0]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[12px] text-[#6b6b6b] font-medium border-b border-dashed border-[#c4c4c4] pb-[1px]">
                    {stat.label}
                  </span>
                  {stat.info && (
                    <Info className="w-3 h-3 text-[#9a9a9a]" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-[#1a1a1a]">
                      {stat.value}
                    </span>
                    <span className="text-[12px] text-[#6b6b6b] font-medium">
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <Sparkline
                  data={stat.data}
                  color={stat.isNegative ? "#e8694a" : "#3aada8"}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-0 border-l border-[#f0f0f0] px-2">
            <button
              onClick={() => setStatPage((p) => Math.max(0, p - 1))}
              disabled={!canGoBack}
              className="p-1.5 rounded-md hover:bg-[#f5f5f5] disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-[#4a4a4a]" />
            </button>
            <button
              onClick={() => setStatPage((p) => p + 1)}
              disabled={!canGoForward}
              className="p-1.5 rounded-md hover:bg-[#f5f5f5] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-[#4a4a4a]" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-[#e8e8e8] shadow-sm overflow-hidden">
          <div className="p-3 border-b border-[#f0f0f0] flex items-center justify-between bg-[#fafafa]">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                <input
                  type="text"
                  placeholder="Filter orders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e3e3e3] rounded-md pl-9 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#8a8a8a] focus:ring-1 focus:ring-[#8a8a8a] transition-all shadow-sm"
                />
              </div>
              <button
                onClick={() => toast.success("Action clicked!")}
                className="bg-white border border-[#e3e3e3] text-[#1a1a1a] text-[13px] font-semibold px-3 py-1.5 rounded-md hover:bg-[#f5f5f5] flex items-center gap-2 shadow-sm transition-colors"
              >
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#6b6b6b]">
                <Search className="w-8 h-8 mb-3 text-[#d4d4d4]" />
                <p className="text-[14px] font-medium text-[#1a1a1a]">
                  No orders found
                </p>
                <p className="text-[13px]">
                  Try changing your search or filters
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-[#f0f0f0]">
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a] w-12">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Order
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Customer
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Total
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Payment status
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Fulfillment status
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a]">
                      Items
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-semibold text-[#1a1a1a] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b]">
                        {order.date}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a]">
                        {order.total}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium border
                          ${
                            order.payment === "Paid"
                              ? "bg-[#e0f5e9] border-[#b0e3c5] text-[#136b32]"
                              : order.payment === "Pending"
                              ? "bg-[#fef0d5] border-[#fce0ab] text-[#855a00]"
                              : order.payment === "Declined"
                              ? "bg-[#ffe4e0] border-[#ffc5c0] text-[#a11e12]"
                              : "bg-[#f5f5f5] border-[#e8e8e8] text-[#4a4a4a]"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full 
                            ${
                              order.payment === "Paid"
                                ? "bg-[#136b32]"
                                : order.payment === "Pending"
                                ? "bg-[#d99400]"
                                : order.payment === "Declined"
                                ? "bg-[#d82c20]"
                                : "bg-[#8a8a8a]"
                            }`}
                          ></div>
                          {order.payment}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border
                          ${
                            order.fulfillment === "Fulfilled"
                              ? "bg-[#f5f5f5] border-[#e8e8e8] text-[#1a1a1a]"
                              : order.fulfillment === "Returned"
                              ? "bg-[#ffe4e0] border-[#ffc5c0] text-[#a11e12]"
                              : "bg-[#fff5cc] border-[#ffe899] text-[#8a6100]"
                          }`}
                        >
                          {order.fulfillment}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6b6b6b]">
                        {order.items} items
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.payment === "Pending" ? (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                handlePaymentAction(order.id, "accept")
                              }
                              className="p-1 hover:bg-[#e0f5e9] text-[#136b32] rounded transition-colors"
                              title="Accept Payment"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentAction(order.id, "decline")
                              }
                              className="p-1 hover:bg-[#ffe4e0] text-[#a11e12] rounded transition-colors"
                              title="Decline Payment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}