"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ClipboardList, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import CurrencySelector from "@/components/CurrencySelector";

const MARKET_CATEGORIES = [
  { label: "Jerseys", slug: "jersey" },
  { label: "Windbreakers", slug: "windbreaker" },
  { label: "Jackets", slug: "jackets" },
  { label: "Hoodies", slug: "hoody" },
  { label: "Tracksuits", slug: "tracksuit" },
  { label: "Kids", slug: "kids" },
  { label: "NBA / NFL", slug: "nba-nfl" },
  { label: "F1", slug: "f1" },
  { label: "Retro Kits", slug: "retro-kits" },
  { label: "Fan Made", slug: "fan-made" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const submitDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const submitMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = mobileQuery.trim();
    if (q.length < 2) return;
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const categoryActive = (slug: string) => pathname === `/league/${slug}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Tier 1 — dark strip */}
      <div className="bg-[var(--brand-top-bar)] text-white/90 border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
              <CurrencySelector variant="onDark" />
              <span className="hidden sm:inline text-white/35">|</span>
              <span className="text-white/90 text-center sm:text-left">
                Worldwide delivery — rates shown at checkout
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6">
              {status === "authenticated" ? (
                <Link href="/account" className="hover:text-white transition-colors">
                  My account
                </Link>
              ) : (
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  My account
                </Link>
              )}
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2 — forest green + search */}
      <div className="bg-brand-green border-b border-black/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[3.75rem] sm:h-16 flex items-center gap-3 sm:gap-5">
            <Link href="/" className="shrink-0 flex items-center rounded-md bg-white/10 px-2 py-1 ring-1 ring-white/15">
              <img src="/logo.png" alt="FOOTXI" className="h-6 sm:h-7 w-auto max-w-[132px] object-contain" />
            </Link>

            <form onSubmit={submitDesktopSearch} className="hidden md:flex flex-1 max-w-2xl mx-auto">
              <div className="relative w-full flex items-end border-b border-white/45 focus-within:border-white pb-1">
                <Search className="w-4 h-4 text-white/70 mb-1 mr-2 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jersey titles, seasons, keywords in listing…"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/55 focus:outline-none pb-1"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              {status === "authenticated" ? (
                <div className="relative hidden sm:block" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="p-2 rounded-md text-white/90 hover:bg-white/10 flex items-center gap-1"
                    aria-label="Account menu"
                  >
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-white/30"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <ChevronDown className={`w-3 h-3 ${accountOpen ? "rotate-180" : ""}`} />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-lg p-1.5 z-[60]">
                      <div className="px-2.5 py-2 border-b border-[color:var(--border)] mb-1">
                        <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">
                          {session?.user?.name || "Account"}
                        </p>
                        <p className="text-[11px] text-[var(--muted)] truncate">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        <User className="w-3.5 h-3.5" />
                        My account
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        My orders
                      </Link>
                      {session?.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex p-2 rounded-md text-white/90 hover:bg-white/10"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <Link
                href="/cart"
                className="relative p-2 rounded-md text-white/90 hover:bg-white/10"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-brand-green text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 rounded-md text-white/90 hover:bg-white/10"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3 — white category bar */}
      <div className="bg-white border-b border-[color:var(--border)] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="hidden md:flex min-h-[2.75rem] items-center justify-center gap-1 lg:gap-2 py-1 overflow-x-auto hide-scrollbar">
            {MARKET_CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={`/league/${item.slug}`}
                className={`shrink-0 px-3 py-2 rounded-full text-[11px] lg:text-[12px] font-bold uppercase tracking-wide transition-colors ${
                  categoryActive(item.slug)
                    ? "bg-brand-green text-white"
                    : "text-brand-green hover:bg-[var(--surface-muted)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden flex min-h-[2.5rem] items-center gap-1 py-1 overflow-x-auto hide-scrollbar">
            {MARKET_CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={`/league/${item.slug}`}
                className={`shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  categoryActive(item.slug) ? "bg-brand-green text-white" : "text-brand-green bg-[var(--surface-muted)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[color:var(--border)] bg-white px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={submitMobileSearch} className="relative flex items-end border-b border-brand-green/30 pb-2">
            <Search className="w-4 h-4 text-brand-green mb-1 mr-2" />
            <input
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Search listing title…"
              className="w-full bg-transparent text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {MARKET_CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={`/league/${item.slug}`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-full text-center text-[11px] font-bold uppercase bg-[var(--surface-muted)] text-brand-green"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
