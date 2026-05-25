import Link from "next/link";
import { Activity, BarChart3, BriefcaseBusiness, CircleDollarSign, HandCoins, LayoutDashboard, Menu, ReceiptText, Settings, Users } from "lucide-react";
import { navItems } from "@/lib/constants";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";

const iconByLabel = {
  Dashboard: LayoutDashboard,
  Income: CircleDollarSign,
  Expense: ReceiptText,
  Transactions: Activity,
  Salary: Users,
  Debts: HandCoins,
  Projects: BriefcaseBusiness,
  Analytics: BarChart3,
  Settings
};

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-cyan-300/10 bg-slate-950/70 p-5 backdrop-blur lg:block">
        <Brand />
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = iconByLabel[item.label];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-cyan-300/10 hover:text-cyan-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-cyan-300/10 bg-slate-950 px-4 py-3 lg:hidden">
          <Brand compact />
          <MobileNav>
            <Menu className="h-5 w-5" />
          </MobileNav>
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-sm font-bold text-cyan-200">
        RV
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold text-cyan-50">Robuverse ERP</p>
          <p className="text-xs text-slate-400">Internal finance OS</p>
        </div>
      )}
    </Link>
  );
}
