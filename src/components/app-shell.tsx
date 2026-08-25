"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CircleDollarSign,
  LogOut,
  Menu,
  X,
  Zap,
  Clock
} from "lucide-react";
import { logoutUser } from "@/lib/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const navigationItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: CircleDollarSign },
  { href: "/salary", label: "Salaries", icon: Zap, disabled: true },
  { href: "/debts", label: "Debts", icon: Clock }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-900 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-slate-900 stroke-none" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Robuverse ERP</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Internal Finance OS</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[9px] font-semibold tracking-wider text-slate-700 bg-slate-800/50 px-1.5 py-0.5 rounded uppercase">Soon</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-red-950/30 border border-slate-700 hover:border-red-900/50 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-red-200 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-900">
            <Zap className="h-4.5 w-4.5 fill-slate-900 stroke-none" />
          </div>
          <div>
            <p className="text-xs font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Robuverse ERP</p>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-slate-900 p-6 border-l border-slate-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <span className="font-semibold text-slate-200">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed select-none"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-[8px] font-semibold text-slate-700 bg-slate-850 px-1 py-0.5 rounded uppercase">Soon</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400"
                        : "text-slate-400 hover:bg-slate-800/30"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-800">
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-red-950/30 border border-slate-700 hover:border-red-900/50 px-4 py-3 text-sm font-medium text-slate-300 hover:text-red-200 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
