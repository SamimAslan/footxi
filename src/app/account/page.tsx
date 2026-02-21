"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  Loader2,
  User,
  Clock,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface OrderSummary {
  _id: string;
  items: { team: string; kitType: string; quantity: number }[];
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const removableStatuses = ["pending", "cancelled", "declined"];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const deleteOrder = useCallback(async () => {
    if (!confirmDeleteId) return;
    const orderId = confirmDeleteId;

    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* User Info */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-zinc-900 border border-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {session?.user?.name}
            </h1>
            <p className="text-sm text-zinc-500">{session?.user?.email}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Your Orders
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Track and manage your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-2">No orders yet</p>
            <p className="text-sm text-zinc-600 mb-6">
              Your order history will appear here
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors group relative"
              >
                <div className="flex items-center">
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="flex-1 min-w-0 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-zinc-500">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                              statusColors[order.status] || statusColors.pending
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <span
                              key={i}
                              className="text-sm text-zinc-300"
                            >
                              {item.team} ({item.kitType})
                              {i < Math.min(order.items.length, 3) - 1 && ","}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-zinc-500">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-white">
                          {formatPrice(order.total)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 mt-2 ml-auto transition-colors" />
                      </div>
                    </div>
                  </Link>

                  {removableStatuses.includes(order.status) && (
                    <div className="flex-shrink-0 pr-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmDeleteId(order._id);
                        }}
                        disabled={deletingId === order._id}
                        className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove from list"
                      >
                        {deletingId === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Remove Order"
        message="Are you sure you want to remove this order from your list? This action cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={deleteOrder}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
