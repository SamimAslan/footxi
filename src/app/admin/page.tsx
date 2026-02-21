"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Shirt,
  TrendingUp,
  ChevronRight,
  PackageCheck,
  BarChart3,
} from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  paid: number;
  accepted: number;
  shipped: number;
  delivered: number;
  declined: number;
  cancelled: number;
  revenue: number;
}

interface OrderRow {
  _id: string;
  email: string;
  items: { team: string; kitType: string; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const statusDots: Record<string, string> = {
  pending: "bg-amber-400",
  paid: "bg-blue-400",
  accepted: "bg-teal-400",
  shipped: "bg-purple-400",
  delivered: "bg-emerald-400",
  declined: "bg-red-400",
  cancelled: "bg-zinc-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders?limit=1000");
      const data = await res.json();
      const orders = data.orders || [];
      const s: Stats = {
        total: orders.length,
        pending: 0,
        paid: 0,
        accepted: 0,
        shipped: 0,
        delivered: 0,
        declined: 0,
        cancelled: 0,
        revenue: 0,
      };
      for (const o of orders) {
        const key = o.status as keyof Stats;
        if (key in s && typeof s[key] === "number" && key !== "total" && key !== "revenue") {
          (s[key] as number)++;
        }
        if (!["declined", "cancelled", "pending"].includes(o.status)) {
          s.revenue += o.total;
        }
      }
      setStats(s);
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs text-zinc-600 tracking-wider">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Orders",
      value: stats?.total || 0,
      icon: Package,
      iconBg: "bg-zinc-800",
      iconColor: "text-zinc-300",
      valueColor: "text-white",
      trend: null,
    },
    {
      label: "Revenue",
      value: `CHF ${(stats?.revenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
      trend: null,
    },
    {
      label: "Pending / Paid",
      value: (stats?.pending || 0) + (stats?.paid || 0),
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      valueColor: "text-amber-400",
      trend: null,
    },
    {
      label: "Accepted",
      value: stats?.accepted || 0,
      icon: CheckCircle,
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-400",
      valueColor: "text-teal-400",
      trend: null,
    },
    {
      label: "Shipped",
      value: stats?.shipped || 0,
      icon: Truck,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      valueColor: "text-purple-400",
      trend: null,
    },
    {
      label: "Delivered",
      value: stats?.delivered || 0,
      icon: PackageCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
      trend: null,
    },
  ];

  const quickActions = [
    {
      title: "Orders awaiting review",
      subtitle: "Pending & paid orders need attention",
      href: "/admin/orders?status=paid",
      icon: Clock,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      count: (stats?.paid || 0) + (stats?.pending || 0),
      countColor: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "Ready to ship",
      subtitle: "Accepted orders waiting for shipment",
      href: "/admin/orders?status=accepted",
      icon: Truck,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/10",
      count: stats?.accepted || 0,
      countColor: "text-teal-400 bg-teal-500/10",
    },
    {
      title: "Manage products",
      subtitle: "Add, edit, or remove jersey listings",
      href: "/admin/products",
      icon: Shirt,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      count: null,
      countColor: "",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor your store performance and manage operations.
        </p>
      </div>

      {/* ===== KPI GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative bg-[#111114] rounded-2xl border border-white/[0.06] p-4 sm:p-5 hover:border-white/[0.12] hover:bg-[#131316] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-[18px] h-[18px] ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {card.label}
              </p>
              <p className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
                {card.value}
              </p>
              {card.trend !== null ? (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">{card.trend}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] text-zinc-700">&mdash;</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== TWO COLUMN AREA ===== */}
      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        {/* Left: Overview Panel */}
        <div className="lg:col-span-3 bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-[18px] h-[18px] text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Overview</h2>
            </div>
            <div className="flex items-center bg-zinc-900/80 rounded-lg p-0.5 border border-white/[0.06]">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    timeRange === range
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="relative h-48 sm:h-56 rounded-xl bg-zinc-900/40 border border-white/[0.04] overflow-hidden">
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-t border-white/[0.04]" style={{ top: `${(i + 1) * 20}%` }} />
              ))}
            </div>
            {/* Placeholder bars */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-4 pb-3 gap-2">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-amber-400/20 to-amber-400/5 rounded-t-sm border-t border-amber-400/30"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            {/* Overlay text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-zinc-600">Revenue &amp; Orders</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">Chart data coming soon</p>
              </div>
            </div>
          </div>

          {/* Mini Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center py-3 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
              <p className="text-lg font-bold text-white">{stats?.total || 0}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Orders</p>
            </div>
            <div className="text-center py-3 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
              <p className="text-lg font-bold text-emerald-400">
                CHF {(stats?.revenue || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Revenue</p>
            </div>
            <div className="text-center py-3 rounded-xl bg-zinc-900/40 border border-white/[0.04]">
              <p className="text-lg font-bold text-amber-400">
                {(stats?.pending || 0) + (stats?.paid || 0)}
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">Awaiting</p>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="lg:col-span-2 bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Quick Actions
          </h2>

          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-[18px] h-[18px] ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {action.title}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5 truncate">
                      {action.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {action.count !== null && (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${action.countColor}`}>
                        {action.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>

      {/* ===== RECENT ORDERS TABLE ===== */}
      <div className="bg-[#111114] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No orders yet</p>
            <p className="text-xs text-zinc-700 mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 sm:px-6 py-3 bg-[#0d0d10] text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-2">Order</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Items</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 sm:px-6 py-4 border-t border-white/[0.04] hover:bg-white/[0.015] transition-all duration-200 items-center group"
              >
                <div className="md:col-span-2">
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900/60 px-2 py-0.5 rounded">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-xs text-zinc-300 truncate block">{order.email}</span>
                </div>
                <div className="md:col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-xs text-zinc-500">
                        {item.team}{i < Math.min(order.items.length, 2) - 1 && ","}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-[10px] text-zinc-700 bg-zinc-900/60 px-1.5 rounded">
                        +{order.items.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <span className="text-sm font-semibold text-white">
                    CHF {order.total.toFixed(2)}
                  </span>
                </div>
                <div className="md:col-span-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                      statusColors[order.status] || statusColors.pending
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status] || statusDots.pending}`} />
                    {order.status}
                  </span>
                </div>
                <div className="md:col-span-1 flex items-center text-[11px] text-zinc-600">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
