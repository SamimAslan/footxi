"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Shield,
  Package,
  LayoutDashboard,
  ArrowLeft,
  Shirt,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Shirt,
  },
];

function getBreadcrumb(pathname: string) {
  if (pathname === "/admin") return [{ label: "Dashboard", href: "/admin" }];
  const segments = pathname.replace("/admin/", "").split("/");
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/admin" },
  ];
  if (segments[0] === "orders") {
    crumbs.push({ label: "Orders", href: "/admin/orders" });
    if (segments[1]) crumbs.push({ label: `#${segments[1].slice(-8).toUpperCase()}`, href: pathname });
  } else if (segments[0] === "products") {
    crumbs.push({ label: "Products", href: "/admin/products" });
    if (segments[1] === "new") crumbs.push({ label: "New Product", href: pathname });
    else if (segments[1]) crumbs.push({ label: "Edit", href: pathname });
  }
  return crumbs;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (
    status === "loading" ||
    status === "unauthenticated" ||
    session?.user?.role !== "admin"
  ) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs text-zinc-600 tracking-wider uppercase">Loading admin...</span>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumb(pathname);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-[#0c0c0f] border-r border-white/[0.06] transition-all duration-300 ease-in-out hidden lg:flex flex-col ${
          sidebarOpen ? "w-60" : "w-[68px]"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-white/[0.06] ${sidebarOpen ? "px-5 justify-between" : "px-0 justify-center"}`}>
          {sidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">FOOTXI</span>
                <span className="text-[9px] text-zinc-600 block -mt-0.5 tracking-widest uppercase">Admin</span>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </Link>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg transition-all duration-200 ${
                  sidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                } ${
                  isActive
                    ? "bg-amber-400/[0.08] text-amber-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
                )}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                {sidebarOpen && (
                  <span className={`text-[13px] font-medium ${isActive ? "text-amber-400" : ""}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`border-t border-white/[0.06] py-4 px-3`}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex justify-center p-2.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
            >
              <PanelLeft className="w-[18px] h-[18px]" />
            </button>
          )}
          <Link
            href="/"
            className={`flex items-center gap-2.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors ${
              sidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
            }`}
          >
            <ArrowLeft className="w-[18px] h-[18px] flex-shrink-0" />
            {sidebarOpen && <span className="text-[13px]">Back to store</span>}
          </Link>
        </div>
      </aside>

      {/* ===== MAIN WRAPPER ===== */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-60" : "lg:ml-[68px]"
        }`}
      >
        {/* ===== TOPBAR ===== */}
        <header className="sticky top-0 z-30 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile menu + Breadcrumbs */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="text-white font-medium">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              {/* Mobile: just page title */}
              <span className="sm:hidden text-sm font-medium text-white">
                {breadcrumbs[breadcrumbs.length - 1]?.label}
              </span>
            </div>

            {/* Right: User */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2.5">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/[0.06]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.06] flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-zinc-300 leading-tight">
                    {session?.user?.name || session?.user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-zinc-600 leading-tight">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 left-0 z-50 h-full w-64 bg-[#0c0c0f] border-r border-white/[0.06] lg:hidden">
              <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white tracking-tight">FOOTXI</span>
                    <span className="text-[9px] text-zinc-600 block -mt-0.5 tracking-widest uppercase">Admin</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-amber-400/[0.08] text-amber-400"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
                      )}
                      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                      <span className={`text-[13px] font-medium ${isActive ? "text-amber-400" : ""}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] py-4 px-3">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
                >
                  <ArrowLeft className="w-[18px] h-[18px]" />
                  <span className="text-[13px]">Back to store</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ===== PAGE CONTENT ===== */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
