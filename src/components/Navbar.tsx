"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ClipboardList, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import CurrencySelector from "@/components/CurrencySelector";

/** Primary shop destinations — no duplicate strip below (single nav row). */
const PRIMARY_NAV = [
  { label: "Jerseys", slug: "jersey" },
  { label: "Retro", slug: "retro-kits" },
  { label: "Kids", slug: "kids" },
  { label: "Tracksuits", slug: "tracksuit" },
  { label: "Fan made", slug: "fan-made" },
  { label: "International", slug: "international-teams" },
] as const;

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
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Mobile: hide bar on scroll down, show on scroll up; safe-area strip stays solid (separate layer). */
  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1024) {
        setMobileNavCollapsed(false);
        lastScrollY.current = window.scrollY;
        return;
      }
      if (mobileOpen) {
        lastScrollY.current = window.scrollY;
        return;
      }
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;
      if (y < 24) {
        setMobileNavCollapsed(false);
        return;
      }
      if (delta > 10) setMobileNavCollapsed(true);
      else if (delta < -10) setMobileNavCollapsed(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

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

  const navActive = (slug: string) => pathname === `/league/${slug}`;

  return (
    <>
      {/* Opaque fill for status bar / notch — always solid, never shows page bleed-through */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[55] bg-[#0c0f0d] h-[var(--safe-area-top)] min-h-0"
        aria-hidden
      />
      <nav
        className={`fixed inset-x-0 top-[var(--safe-area-top)] z-50 transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
          mobileNavCollapsed ? "max-lg:-translate-y-full lg:translate-y-0" : "translate-y-0"
        }`}
        aria-label="Main"
      >
      {/* Tier 1 — utility only */}
      <div className="border-b border-white/[0.06] bg-[#0c0f0d] text-white/80">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.14em] sm:justify-start">
            <CurrencySelector variant="onDark" />
            <span className="hidden text-white/30 sm:inline" aria-hidden>
              |
            </span>
            <span className="text-center sm:text-left">Worldwide delivery — rates at checkout</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <Link
              href="/contact"
              className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/85 transition hover:text-white"
            >
              Help &amp; contact
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2 — logo · categories · search · account · cart */}
      <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-[#151a18] to-[#0e1210]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-[1600px] px-3 sm:px-5 lg:px-8">
          <div className="flex h-[3.5rem] items-center gap-2 sm:h-16 sm:gap-3">
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-lg bg-white/8 px-2 py-1 ring-1 ring-white/10 sm:rounded-xl sm:px-2.5 sm:py-1.5"
              aria-label="FootXI home"
            >
              <img src="/logo.png" alt="" className="h-6 w-auto max-w-[120px] object-contain sm:h-7 sm:max-w-[132px]" />
            </Link>

            <nav
              className="mx-1 hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex md:gap-0.5 lg:gap-1 xl:gap-2"
              aria-label="Shop categories"
            >
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.slug}
                  href={`/league/${item.slug}`}
                  className={`shrink-0 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition xl:px-2.5 xl:text-[11px] ${
                    navActive(item.slug)
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={submitDesktopSearch}
              className="mx-auto hidden min-w-0 flex-1 md:mx-0 md:flex md:max-w-md lg:max-w-lg xl:max-w-xl"
            >
              <div className="relative flex w-full items-center gap-2 rounded-full border border-white/12 bg-black/35 py-2 pl-3 pr-2 shadow-inner shadow-black/30 backdrop-blur-md focus-within:border-white/20">
                <Search className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by club, season, retro, or league…"
                  aria-label="Search products"
                  autoComplete="off"
                  className="site-search-input min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none sm:text-[14px]"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/18"
                >
                  Go
                </button>
              </div>
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <Link
                href="/search"
                className="flex p-2 text-white/85 hover:bg-white/10 md:hidden rounded-md"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Link>

              {status === "authenticated" ? (
                <div className="relative hidden sm:block" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-1 rounded-md p-2 text-white/90 hover:bg-white/10"
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                    aria-haspopup="true"
                  >
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-7 w-7 rounded-full border border-white/30 object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <ChevronDown className={`h-3 w-3 ${accountOpen ? "rotate-180" : ""}`} />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full z-[60] mt-2 w-52 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
                      <div className="mb-1 border-b border-[color:var(--border)] px-2.5 py-2">
                        <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">
                          {session?.user?.name || "Account"}
                        </p>
                        <p className="truncate text-[11px] text-[var(--muted)]">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        <User className="h-3.5 w-3.5" />
                        My account
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        My orders
                      </Link>
                      {session?.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden rounded-md p-2 text-white/90 hover:bg-white/10 sm:flex"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              <Link
                href="/cart"
                className="relative rounded-md p-2 text-white/90 hover:bg-white/10"
                aria-label={
                  mounted && totalItems > 0 ? `Shopping cart, ${totalItems} items` : "Shopping cart"
                }
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-zinc-900">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen((open) => {
                    const next = !open;
                    if (next) setMobileNavCollapsed(false);
                    return next;
                  });
                }}
                className="rounded-md p-2 text-white/90 hover:bg-white/10 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-panel"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* Full-screen mobile menu — outside nav so header translate/half-height doesn’t clip it */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-[#13161c] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu and search"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0e1115] px-4 py-3 pt-[max(0.75rem,var(--safe-area-top))]">
            <span className="text-[15px] font-semibold tracking-tight text-white">Menu</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2.5 text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
            <form onSubmit={submitMobileSearch} className="mb-6 flex flex-col gap-2 border-b border-white/[0.08] pb-6">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Search</label>
              <div className="flex gap-2">
                <input
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                  placeholder="Club, season, retro, league…"
                  aria-label="Search products"
                  autoComplete="off"
                  className="site-search-input min-w-0 flex-1 rounded-xl border border-white/12 bg-black/35 px-3 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand-green px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
                >
                  Go
                </button>
              </div>
            </form>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/50">Shop</p>
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile categories">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.slug}
                  href={`/league/${item.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl border px-3 py-3.5 text-center text-[11px] font-bold uppercase tracking-wide transition ${
                    navActive(item.slug)
                      ? "border-brand-green/40 bg-brand-green/15 text-white"
                      : "border-white/[0.08] bg-white/[0.04] text-white/90 hover:border-white/15"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.08] pt-6">
              <Link
                href={status === "authenticated" ? "/account" : "/auth/login"}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-[15px] font-medium text-white"
              >
                {status === "authenticated" ? "My account" : "Sign in"}
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] text-white/75">
                Help &amp; contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
