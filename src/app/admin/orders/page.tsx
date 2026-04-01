"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  Clock,
  Filter,
  Package,
  Trash2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}

interface OrderRow {
  _id: string;
  email: string;
  items: { team: string; kitType: string; quantity: number }[];
  total: number;
  status: string;
  shippingMethod: string;
  createdAt: string;
}

const statuses = [
  "all",
  "paid",
  "accepted",
  "shipped",
  "delivered",
  "declined",
  "cancelled",
];

const statusColors: Record<string, string> = {
  awaiting_payment: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", confirmLabel: "", onConfirm: () => {} });

  const fetchOrders = useCallback(async (status: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders?status=${status}&page=${p}&limit=20`
      );
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(statusFilter, page);
  }, [statusFilter, page, fetchOrders]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o._id)));
    }
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    setConfirmModal({
      open: true,
      title: "Delete Orders",
      message: `Are you sure you want to delete ${selected.size} order${selected.size > 1 ? "s" : ""}? This action cannot be undone.`,
      confirmLabel: `Delete ${selected.size} order${selected.size > 1 ? "s" : ""}`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await Promise.all(
            Array.from(selected).map((id) =>
              fetch(`/api/admin/orders/${id}`, { method: "DELETE" })
            )
          );
          setSelected(new Set());
          fetchOrders(statusFilter, page);
        } catch {
          // ignore
        } finally {
          setDeleting(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const deleteSingle = (orderId: string) => {
    setConfirmModal({
      open: true,
      title: "Delete Order",
      message: "Are you sure you want to delete this order? This action cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setDeleting(true);
        try {
          await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
          fetchOrders(statusFilter, page);
        } catch {
          // ignore
        } finally {
          setDeleting(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">Orders</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {total} total orders
          </p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete {selected.size} order{selected.size > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${
              statusFilter === s
                ? "bg-brand-green/10 text-white border border-brand-green/30"
                : "bg-[var(--surface)] text-[var(--muted)] border border-[color:var(--border)] hover:text-[var(--foreground)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-[color:var(--border)] p-12 text-center">
          <Package className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--muted)]">No orders found</p>
          <p className="text-xs text-[var(--muted)] mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[color:var(--border)] overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[40px_repeat(12,minmax(0,1fr))] gap-4 px-5 py-3 bg-[var(--surface-muted)] border-b border-[color:var(--border)] text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider items-center">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selected.size === orders.length}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-brand-green cursor-pointer"
                />
              </div>
              <div className="col-span-2">Order ID</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-3">Items</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Shipping</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            {orders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-1 md:grid-cols-[40px_repeat(12,minmax(0,1fr))] gap-2 md:gap-4 px-5 py-4 border-b border-[color:var(--border)] hover:bg-[var(--surface-muted)] transition-all duration-200 items-center group"
              >
                <div className="hidden md:flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(order._id)}
                    onChange={() => toggleSelect(order._id)}
                    className="w-3.5 h-3.5 rounded accent-brand-green cursor-pointer"
                  />
                </div>
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="md:col-span-2 contents md:block"
                >
                  <span className="text-xs font-mono text-[var(--muted)]">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </Link>
                <div className="md:col-span-2">
                  <span className="text-xs text-[var(--foreground)] truncate block">
                    {order.email}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-xs text-[var(--muted)]">
                        {item.team}
                        {i < Math.min(order.items.length, 2) - 1 && ","}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-xs text-[var(--muted)]">
                        +{order.items.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    CHF {order.total.toFixed(2)}
                  </span>
                </div>
                <div className="md:col-span-1">
                  <span className="text-[10px] text-[var(--muted)] uppercase">
                    {order.shippingMethod}
                  </span>
                </div>
                <div className="md:col-span-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                      statusColors[order.status] || statusColors.awaiting_payment
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="md:col-span-1 flex items-center gap-1 text-[10px] text-[var(--muted)]">
                  <Clock className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="md:col-span-1 flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSingle(order._id);
                    }}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link href={`/admin/orders/${order._id}`}>
                    <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[color:var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant="danger"
        loading={deleting}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
