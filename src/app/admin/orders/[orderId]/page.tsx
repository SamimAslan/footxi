"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  CreditCard,
  User,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Send,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface OrderDetail {
  _id: string;
  email: string;
  items: {
    productId: string;
    name: string;
    team: string;
    league: string;
    kitType: string;
    type: string;
    size: string;
    quantity: number;
    badges: { name: string; price: number }[];
    customName: string;
    customNumber: string;
    hasCustomNameNumber: boolean;
    unitPrice: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    zip: string;
    phone: string;
  };
  shippingMethod: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

const statusActions = [
  {
    from: ["paid"],
    to: "accepted",
    label: "Accept Order",
    icon: CheckCircle,
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
  },
  {
    from: ["paid", "pending"],
    to: "declined",
    label: "Decline Order",
    icon: XCircle,
    color: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
  },
  {
    from: ["accepted"],
    to: "shipped",
    label: "Mark as Shipped",
    icon: Truck,
    color: "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20",
  },
  {
    from: ["shipped"],
    to: "delivered",
    label: "Mark as Delivered",
    icon: Package,
    color: "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20",
  },
  {
    from: ["pending", "paid", "accepted", "shipped"],
    to: "cancelled",
    label: "Cancel Order",
    icon: AlertTriangle,
    color: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  declined: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "warning" | "default";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", confirmLabel: "", variant: "default", onConfirm: () => {} });

  useEffect(() => {
    if (orderId) {
      fetch(`/api/admin/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setAdminNote(data.adminNote || "");
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [orderId]);

  const updateStatus = (newStatus: string) => {
    if (!order) return;

    const isDanger = newStatus === "declined" || newStatus === "cancelled";
    setConfirmModal({
      open: true,
      title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Order`,
      message: `Are you sure you want to change this order's status to "${newStatus}"?${
        newStatus === "declined" ? " A refund will be initiated if payment was made." : ""
      }`,
      confirmLabel: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      variant: isDanger ? "danger" : "warning",
      onConfirm: async () => {
        setUpdating(true);
        try {
          const res = await fetch(`/api/admin/orders/${order._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, adminNote }),
          });
          if (res.ok) {
            const updated = await res.json();
            setOrder(updated);
          }
        } catch {
          // ignore
        } finally {
          setUpdating(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const deleteOrder = () => {
    if (!order) return;
    setConfirmModal({
      open: true,
      title: "Delete Order",
      message: "Permanently delete this order? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setUpdating(true);
        try {
          const res = await fetch(`/api/admin/orders/${order._id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            router.push("/admin/orders");
          }
        } catch {
          // ignore
        } finally {
          setUpdating(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const saveNote = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-zinc-400">Order not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-amber-400"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const availableActions = statusActions.filter((a) =>
    a.from.includes(order.status)
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            Order #{order._id.slice(-8).toUpperCase()}
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                statusColors[order.status] || statusColors.pending
              }`}
            >
              {order.status}
            </span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items + Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                    <svg
                      viewBox="0 0 120 150"
                      className="w-6 h-7 opacity-40"
                    >
                      <path
                        d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z"
                        className="fill-zinc-700"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">
                      {item.team} - {item.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {item.kitType.toUpperCase()} &middot; {item.type} &middot;
                      Size {item.size} &middot; Qty: {item.quantity} &middot;
                      CHF {item.unitPrice}/unit
                    </p>
                    {item.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.badges.map((b, j) => (
                          <span
                            key={j}
                            className="text-[9px] px-1.5 py-0.5 bg-amber-400/10 text-amber-400"
                          >
                            {b.name} (+CHF {b.price})
                          </span>
                        ))}
                      </div>
                    )}
                    {item.hasCustomNameNumber && (
                      <p className="text-[10px] text-amber-400/60 mt-1">
                        Custom: {item.customName} #{item.customNumber} (+CHF 5)
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white flex-shrink-0">
                    CHF {item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </h2>
              <p className="text-sm text-white font-medium">{order.email}</p>
              <p className="text-xs text-zinc-500 mt-1 font-mono">
                User: {order._id}
              </p>
              {order.stripePaymentIntentId && (
                <p className="text-xs text-zinc-600 mt-2">
                  Stripe PI: {order.stripePaymentIntentId}
                </p>
              )}
            </div>

            <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping
              </h2>
              <div className="text-sm text-zinc-300 space-y-1">
                <p className="font-medium text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-zinc-500">{order.shippingAddress.phone}</p>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                {order.shippingMethod === "express"
                  ? "Express (7-15 days)"
                  : "Standard (15-30 days)"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions + Payment */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Actions
            </h2>
            {availableActions.length === 0 ? (
              <p className="text-xs text-zinc-600">
                No actions available for this status.
              </p>
            ) : (
              <div className="space-y-2">
                {availableActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.to}
                      onClick={() => updateStatus(action.to)}
                      disabled={updating}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ${action.color}`}
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button
                onClick={deleteOrder}
                disabled={updating}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 bg-red-500/5 border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Order
              </button>
            </div>
          </div>

          {/* Admin Note */}
          <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Admin Note
            </h2>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-[#0d0d10] rounded-xl border border-white/[0.06] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors resize-none"
              placeholder="Add a note (visible to customer if declined)"
            />
            <button
              onClick={saveNote}
              disabled={updating}
              className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-zinc-800/60 border border-white/[0.06] text-zinc-300 hover:text-white hover:border-white/[0.12] transition-all disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              Save Note
            </button>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#111114] rounded-2xl border border-white/[0.06] p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">
                  CHF {order.subtotal.toFixed(2)}
                </span>
              </div>
              {order.discountPercent > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({order.discountPercent}%)</span>
                  <span>-CHF {order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-white">
                  CHF {order.shippingCost.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-lg font-bold text-amber-400">
                    CHF {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        loading={updating}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
