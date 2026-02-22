"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Search,
  User,
  LogOut,
  Package,
  Shield,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { leagues, Product, getProductId } from "@/data/products";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelector from "./CurrencySelector";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leaguesOpen, setLeaguesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(q)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 8));
        }
      } catch {
        setResults([]);
      }
    }, 200);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const goToProduct = (p: Product) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/product/${getProductId(p)}`);
  };

  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0F14]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <Link
                href="/"
                className="text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300 tracking-wide"
              >
                Home
              </Link>

              {/* Leagues Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setLeaguesOpen(true)}
                onMouseLeave={() => setLeaguesOpen(false)}
              >
                <button className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300 py-2 tracking-wide">
                  Leagues
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {leaguesOpen && (
                  <div className="absolute top-full left-0 pt-1 w-56">
                    <div className="bg-[#141721] border border-white/[0.06] shadow-2xl shadow-black/40 py-2">
                      {leagues.map((league) => (
                        <Link
                          key={league.slug}
                          href={`/league/${league.slug}`}
                          className="block px-4 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                          onClick={() => setLeaguesOpen(false)}
                        >
                          <span className="flex items-center justify-between">
                            {league.name}
                            <span className="text-[10px] text-[#9CA3AF]/40">
                              {league.country}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                className="text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300 tracking-wide"
              >
                Contact
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={openSearch}
                className="p-2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300"
                title="Search (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              {/* Auth */}
              {status === "authenticated" && session?.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-white/[0.08]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-[#141721] border border-white/[0.08] rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gold uppercase">
                          {session.user.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#141721] border border-white/[0.06] shadow-2xl shadow-black/40 py-2">
                      <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-white/[0.08] flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-[#1A1D2B] border border-white/[0.08] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gold uppercase">
                              {session.user.name?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F3F4F6] truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]/60 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gold hover:text-gold-light hover:bg-white/[0.03] transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#9CA3AF]/60 hover:text-red-400 hover:bg-white/[0.03] transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : status === "unauthenticated" ? (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-medium text-[#9CA3AF] hover:text-[#F3F4F6] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 tracking-wide"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              ) : null}

              <Link
                href="/cart"
                className="relative p-2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-[#0D0F14] text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden p-2 text-[#9CA3AF] hover:text-[#F3F4F6]"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#141721]/95 backdrop-blur-xl border-t border-white/[0.04]">
            <div className="px-6 py-5 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <div className="px-3 py-2 text-[10px] font-semibold text-[#9CA3AF]/40 uppercase tracking-[0.2em]">
                Leagues
              </div>
              {leagues.map((league) => (
                <Link
                  key={league.slug}
                  href={`/league/${league.slug}`}
                  className="block px-6 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {league.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block px-3 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>

              <div className="border-t border-white/[0.04] pt-3 mt-3">
                {status === "authenticated" && session?.user ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-3 py-2.5 text-[13px] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.03] transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2.5 text-[13px] text-gold hover:text-gold-light hover:bg-white/[0.03] transition-all duration-200"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-3 py-2.5 text-[13px] text-[#9CA3AF]/60 hover:text-red-400 hover:bg-white/[0.03] transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2.5 text-[13px] text-gold hover:text-gold-light hover:bg-white/[0.03] transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-[#0D0F14]/85 backdrop-blur-md" />

          <div
            ref={searchRef}
            className="relative w-full max-w-xl mx-4 animate-[fadeSlideIn_0.2s_ease-out]"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search teams, leagues, kits..."
                className="w-full pl-12 pr-16 py-4 bg-[#141721] border border-white/[0.06] text-[#F3F4F6] text-sm placeholder:text-[#9CA3AF]/30 focus:outline-none focus:border-gold/20 transition-colors"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-[#9CA3AF]/30 border border-white/[0.04] bg-[#1A1D2B]">
                ESC
              </kbd>
            </div>

            {query.trim().length >= 2 && (
              <div className="mt-1 bg-[#141721] border border-white/[0.06] max-h-[50vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]/60">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-2 border-b border-white/[0.04]">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[#9CA3AF]/40 uppercase">
                        {results.length} results
                      </span>
                    </div>
                    {results.map((product) => (
                      <button
                        key={getProductId(product)}
                        onClick={() => goToProduct(product)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-[#1A1D2B] flex items-center justify-center overflow-hidden">
                          {product.image &&
                          product.image.startsWith("http") ? (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-white/[0.1]">
                              {product.team.substring(0, 3)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F3F4F6] truncate">
                            {product.team}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]/40 tracking-wide">
                            {product.league.toUpperCase()} &middot;{" "}
                            {product.type.toUpperCase()} &middot;{" "}
                            {product.kitType.toUpperCase()}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-[#F3F4F6] flex-shrink-0">
                          {formatPrice(
                            product.kitType === "fans"
                              ? 25
                              : product.kitType === "player"
                              ? 30
                              : 33
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="mt-1 bg-[#141721] border border-white/[0.06] px-4 py-6">
                <p className="text-[11px] text-[#9CA3AF]/30 text-center tracking-wide">
                  Type at least 2 characters to search
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    "Barcelona",
                    "Liverpool",
                    "Galatasaray",
                    "Milan",
                    "Retro",
                  ].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => {
                        handleSearch(hint);
                        if (inputRef.current) inputRef.current.value = hint;
                      }}
                      className="px-3.5 py-1.5 text-[10px] font-medium tracking-[0.1em] text-[#9CA3AF]/40 bg-white/[0.02] border border-white/[0.04] hover:text-gold hover:border-gold/20 transition-all duration-300"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
