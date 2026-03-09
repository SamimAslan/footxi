"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ClipboardList, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
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
  { label: "Retro Kits", slug: "retro-kits" },
  { label: "Fan Made", slug: "fan-made" },
];

export default function Navbar() {
  const router = useRouter();
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--border)] bg-[var(--surface)] shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
          </Link>

          <form onSubmit={submitDesktopSearch} className="hidden md:flex flex-1 relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs, leagues, players, retro kits..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-gold/40"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <CurrencySelector />

            {status === "authenticated" ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] flex items-center gap-1"
                  aria-label="Account menu"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-[color:var(--border)]"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full border border-[color:var(--border)] bg-[var(--surface)] flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[0_10px_26px_rgba(0,0,0,0.12)] p-1.5 z-50">
                    <div className="px-2.5 py-2 border-b border-[color:var(--border)] mb-1">
                      <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">{session?.user?.name || "Account"}</p>
                      <p className="text-[11px] text-[var(--muted)] truncate">{session?.user?.email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Account
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      My Orders
                    </Link>
                    {session?.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] rounded-lg text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Admin Panel
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
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gold text-[#111] text-[11px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="hidden md:flex h-11 items-center gap-2 overflow-x-auto hide-scrollbar border-t border-[color:var(--border)]">
          {MARKET_CATEGORIES.map((item) => (
            <Link
              key={item.slug}
              href={`/league/${item.slug}`}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="md:hidden h-10 flex items-center gap-2 overflow-x-auto hide-scrollbar border-t border-[color:var(--border)]">
          {MARKET_CATEGORIES.map((item) => (
            <Link
              key={item.slug}
              href={`/league/${item.slug}`}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[color:var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3">
          <form onSubmit={submitMobileSearch} className="relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Search clubs, leagues, players..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-gold/40"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {MARKET_CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={`/league/${item.slug}`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg text-[12px] text-[var(--foreground)] bg-[var(--surface-muted)]"
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
