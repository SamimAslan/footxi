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
    // Debounce API calls
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 8));
        }
      } catch {
        setResults([]);
      }
    }, 200);
  }, []);

  // Close search on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
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

  // Keyboard shortcut: Ctrl+K or Cmd+K
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="FOOTXI" className="h-7 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Home
              </Link>

              {/* Leagues Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setLeaguesOpen(true)}
                onMouseLeave={() => setLeaguesOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors py-2">
                  Leagues
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {leaguesOpen && (
                  <div className="absolute top-full left-0 pt-1 w-56">
                  <div className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl py-2">
                    {leagues.map((league) => (
                      <Link
                        key={league.slug}
                        href={`/league/${league.slug}`}
                        className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setLeaguesOpen(false)}
                      >
                        <span className="flex items-center justify-between">
                          {league.name}
                          <span className="text-xs text-zinc-500">
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
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Search + Auth + Cart + Mobile Menu */}
            <div className="flex items-center gap-1.5">
              {/* Search button */}
              <button
                onClick={openSearch}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Currency Selector */}
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              {/* Auth */}
              {status === "authenticated" && session?.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">
                          {session.user.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl py-2">
                      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-400 uppercase">
                              {session.user.name?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
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
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
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
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              ) : null}

              <Link
                href="/cart"
                className="relative p-2 text-zinc-300 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden p-2 text-zinc-300 hover:text-white"
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
          <div className="md:hidden bg-zinc-900/95 backdrop-blur-md border-t border-white/5">
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Leagues
              </div>
              {leagues.map((league) => (
                <Link
                  key={league.slug}
                  href={`/league/${league.slug}`}
                  className="block px-6 py-2.5 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {league.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Auth Links */}
              <div className="border-t border-white/5 pt-3 mt-3">
                {status === "authenticated" && session?.user ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2.5 text-sm text-amber-400 hover:text-amber-300 rounded-lg hover:bg-white/5"
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
                      className="block w-full text-left px-3 py-2.5 text-sm text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2.5 text-sm text-amber-400 hover:text-amber-300 rounded-lg hover:bg-white/5"
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Search panel */}
          <div
            ref={searchRef}
            className="relative w-full max-w-xl mx-4 animate-[fadeSlideIn_0.2s_ease-out]"
          >
            {/* Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search teams, leagues, kits..."
                className="w-full pl-12 pr-16 py-4 bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/30 transition-colors"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-zinc-600 border border-white/5 bg-zinc-800">
                ESC
              </kbd>
            </div>

            {/* Results */}
            {query.trim().length >= 2 && (
              <div className="mt-1 bg-zinc-900 border border-white/10 max-h-[50vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-zinc-500">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-zinc-700 mt-1">
                      Try searching for a team or league name
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-2 border-b border-white/5">
                      <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                        {results.length} results
                      </span>
                    </div>
                    {results.map((product) => (
                      <button
                        key={getProductId(product)}
                        onClick={() => goToProduct(product)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {product.image && product.image.startsWith("http") ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg viewBox="0 0 120 150" className="w-6 h-7 opacity-40">
                              <path d="M30,10 L10,30 L10,50 L25,45 L25,140 L95,140 L95,45 L110,50 L110,30 L90,10 L75,20 L45,20 Z" className="fill-zinc-700" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {product.team}
                          </p>
                          <p className="text-[10px] text-zinc-600 tracking-wide">
                            {product.league.toUpperCase()} &middot;{" "}
                            {product.type.toUpperCase()} &middot;{" "}
                            {product.kitType === "fans"
                              ? "FANS"
                              : product.kitType === "player"
                              ? "PLAYER"
                              : "RETRO"}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-white flex-shrink-0">
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

            {/* Hint when empty */}
            {query.trim().length < 2 && (
              <div className="mt-1 bg-zinc-900 border border-white/10 px-4 py-6">
                <p className="text-xs text-zinc-600 text-center">
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
                      className="px-3 py-1.5 text-[10px] font-medium tracking-wider text-zinc-500 bg-white/[0.02] border border-white/5 hover:text-amber-400 hover:border-amber-400/20 transition-all"
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
