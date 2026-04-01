"use client";

import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">
          Payment Cancelled
        </h1>
        <p className="text-[var(--muted)] mb-8">
          Your payment was cancelled. No charges were made. Your cart items are
          still saved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/cart"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white font-semibold text-sm hover:bg-brand-green-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
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
