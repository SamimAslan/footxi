import { Truck, Lock, Shirt } from "lucide-react";

const DEFAULT_ITEMS = [
  {
    icon: Truck,
    title: "Worldwide shipping",
    body: "Rates and delivery options at checkout.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    body: "Encrypted payment with trusted providers.",
  },
  {
    icon: Shirt,
    title: "Name & number",
    body: "Add customization on eligible kits before cart.",
  },
] as const;

export default function TrustRow({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={`border-y border-[color:var(--border)] bg-[var(--surface)]/40 ${compact ? "py-4" : "py-5 sm:py-6"} ${className ?? ""}`}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:gap-8 sm:px-6 lg:gap-12 lg:px-10">
        {DEFAULT_ITEMS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 sm:max-w-[220px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--surface-muted)]/80 text-brand-green">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">{title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-[var(--muted)]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
