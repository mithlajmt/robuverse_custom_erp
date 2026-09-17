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
  Clock,
  GraduationCap,
  FileText,
  FileSignature,
  Target
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
  { href: "/leads", label: "Leads CRM", icon: Target },
  { href: "/transactions", label: "Transactions", icon: CircleDollarSign },
  { href: "/certificates", label: "Certificates", icon: GraduationCap },
  { href: "/documents", label: "Document Studio", icon: FileText },
  { href: "/salary", label: "Salaries", icon: Zap, disabled: true },
  { href: "/debts", label: "Debts", icon: Clock }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0f172a] border-r border-slate-800 shrink-0 text-white shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-900/60">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-white stroke-none" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-wide text-white">Robuverse ERP</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Agency OS</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[8px] font-bold tracking-wider text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded uppercase">Soon</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-rose-200 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 text-slate-900">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Zap className="h-4.5 w-4.5 fill-white stroke-none" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Robuverse ERP</p>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 border-l border-slate-200 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <span className="font-bold text-slate-900">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
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
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed select-none"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-[8px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded uppercase">Soon</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-100">
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-4 py-3 text-xs font-semibold text-slate-700 hover:text-rose-600 transition-all"
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
      <main className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden bg-slate-50 pb-20 lg:pb-0">
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Native Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {navigationItems.filter((i) => !i.disabled).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? "text-indigo-600 font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? "bg-indigo-50" : ""}`}>
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 stroke-[2.5]" : "text-slate-500"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
