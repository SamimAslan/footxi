"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: "bg-red-500/10 text-red-400",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    icon: "bg-brand-green/15 text-white",
    button: "bg-brand-green hover:bg-brand-green-dark text-white",
  },
  default: {
    icon: "bg-blue-500/10 text-blue-400",
    button: "bg-zinc-700 hover:bg-zinc-600 text-white",
  },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const style = variantStyles[variant];

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current && !loading) onCancel();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-[#141417] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.icon}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-zinc-800/80 border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${style.button}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
