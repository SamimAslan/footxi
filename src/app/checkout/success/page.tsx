"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useEffect, Suspense } from "react";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!orderId) return;
    fetch("/api/orders/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    }).catch(() => {});
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Payment Successful!
        </h1>
        <p className="text-[var(--muted)] mb-2">
          Thank you for your order. Your kits are on their way.
        </p>
        {orderId && (
          <p className="text-xs text-[var(--muted)] mb-8">
            Order ID: <span className="text-[var(--foreground)] font-mono">{orderId}</span>
          </p>
        )}

        <div className="bg-[var(--surface)] border border-[color:var(--border)] p-6 mb-8 text-left">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            What happens next?
          </h2>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <div className="flex gap-3">
              <span className="w-6 h-6 flex-shrink-0 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>We&apos;ll review and confirm your order within 24 hours.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 flex-shrink-0 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>Your kits will be prepared and shipped.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 flex-shrink-0 bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>Track your order status from your account page.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Link
              href={`/account/orders/${orderId}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
            >
              View Order
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] text-sm hover:bg-black/[0.03] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
