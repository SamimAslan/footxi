"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CircleDot,
} from "lucide-react";

interface OrderDetail {
  _id: string;
  email: string;
  items: {
    productId: string;
    name: string;
    team: string;
    league: string;
    image: string;
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
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: "paid", label: "Paid", icon: CreditCard },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
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

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
      return;
    }

    if (authStatus === "authenticated" && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [authStatus, orderId, router, session]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Order not found
          </h1>
          <p className="text-[var(--muted)] mb-6">{error}</p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to account
          </Link>
        </div>
      </div>
    );
  }

  const isNegativeStatus =
    order.status === "declined" || order.status === "cancelled";
  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-3">
              Order #{order._id.slice(-8).toUpperCase()}
              <span
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                  statusColors[order.status] || statusColors.awaiting_payment
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Placed on{" "}
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

        {/* Status Tracker */}
        {!isNegativeStatus && (
          <div className="bg-[var(--surface)] border border-[color:var(--border)] p-6 mb-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-6">
              Order Progress
            </h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 flex items-center justify-center border transition-all ${
                          isCurrent
                            ? "bg-brand-green/15 border-brand-green text-brand-green"
                            : isActive
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-[var(--surface-muted)] border-[color:var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {isActive && !isCurrent ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isCurrent ? (
                          <CircleDot className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-medium ${
                          isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 ${
                          i < currentStepIndex
                            ? "bg-green-500/30"
                            : "bg-[color:var(--border)]"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Declined/Cancelled notice */}
        {isNegativeStatus && (
          <div className="bg-red-500/5 border border-red-500/20 p-6 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-400">
                  Order {order.status.replace(/_/g, " ")}
                </h3>
                {order.adminNote && (
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {order.adminNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-[var(--surface)] border border-[color:var(--border)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 pb-4 border-b border-[color:var(--border)] last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-[var(--surface-muted)] rounded overflow-hidden">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} alt={item.team} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 120 150" className="w-6 h-7 opacity-40">
                          <path d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z" className="fill-slate-400" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--foreground)] font-medium">
                      {item.team}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {item.kitType.toUpperCase()} &middot; {item.type} &middot;
                      Size {item.size} &middot; x{item.quantity}
                    </p>
                    {item.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.badges.map((b, j) => (
                          <span
                            key={j}
                            className="text-[9px] px-1.5 py-0.5 bg-brand-green/10 text-brand-green"
                          >
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.hasCustomNameNumber && (
                      <p className="text-[10px] text-[var(--muted)] mt-1">
                        Custom: {item.customName} #{item.customNumber}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-[var(--surface)] border border-[color:var(--border)] p-6">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h2>
              <div className="text-sm text-[var(--muted)] space-y-1">
                <p className="font-medium text-[var(--foreground)]">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-[var(--muted)]">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
                <Clock className="w-3 h-3" />
                {order.shippingMethod === "express"
                  ? "Express (7-15 days)"
                  : "Standard (15-30 days)"}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[var(--surface)] border border-[color:var(--border)] p-6">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--foreground)]">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({order.discountPercent}%)</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Shipping</span>
                  <span className="text-[var(--foreground)]">
                    {formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div className="border-t border-[color:var(--border)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--foreground)]">Total</span>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
