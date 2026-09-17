import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSummary, getCategories } from "@/lib/repositories/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuickTransactionForm } from "@/components/quick-transaction-form";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  ChevronRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getDashboardSummary();
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user.email?.split("@")[0]}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Here&apos;s an overview of Robuverse&apos;s internal agency finances.
          </p>
        </div>
      </div>

      {/* Finance Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {/* Balance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm">
          <div className="hidden md:block absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Wallet className="h-28 w-28 text-indigo-600" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Balance</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
              <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-base md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.currentBalance)}
            </p>
            <p className="text-[9px] md:text-xs text-slate-500 font-medium mt-0.5 md:mt-1">Operational cash</p>
          </div>
        </div>

        {/* Capital Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm">
          <div className="hidden md:block absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Coins className="h-28 w-28 text-purple-600" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Capital</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 shrink-0">
              <Coins className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-base md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalCapital)}
            </p>
            <p className="text-[9px] md:text-xs text-slate-500 font-medium mt-0.5 md:mt-1">Invested capital</p>
          </div>
        </div>

        {/* Income Card -> Receivables */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm">
          <div className="hidden md:block absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-28 w-28 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Receivables</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-base md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalReceivables)}
            </p>
            <p className="text-[9px] md:text-xs text-slate-500 font-medium mt-0.5 md:mt-1">Debtors (Get)</p>
          </div>
        </div>

        {/* Expense Card -> Payables */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden group shadow-sm">
          <div className="hidden md:block absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <TrendingDown className="h-28 w-28 text-rose-600" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Payables</span>
            <div className="p-1.5 md:p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
              <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-base md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalPayables)}
            </p>
            <p className="text-[9px] md:text-xs text-slate-500 font-medium mt-0.5 md:mt-1">Creditors (Give)</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1">
            {summary.recentTransactions.length > 0 ? (
              <>
                {/* Desktop View Table */}
                <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Details</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 px-4">Method</th>
                      <th className="pb-3 pl-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {summary.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 pr-4 max-w-[200px]">
                          <div className="font-semibold text-slate-900 truncate">{tx.description}</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{formatDate(tx.transactionDate)}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.category?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium text-xs">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div
                            className={`font-bold flex items-center justify-end gap-1 ${
                              tx.type === "CAPITAL"
                                ? "text-purple-600"
                                : tx.type === "INCOME"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {tx.type === "CAPITAL" ? (
                              <ArrowRightLeft className="h-3 w-3" />
                            ) : tx.type === "INCOME" ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3" />
                            )}
                            <span>{formatCurrency(tx.amount.toString())}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile View Card List */}
                <div className="md:hidden space-y-3">
                  {summary.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{tx.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formatDate(tx.transactionDate)} • {tx.paymentMethod}
                        </p>
                        <span className="inline-block text-[10px] px-2 py-0.5 mt-2 rounded-full font-semibold bg-white text-slate-600 border border-slate-200">
                          {tx.category?.name}
                        </span>
                      </div>
                      <div
                        className={`font-bold flex items-center shrink-0 gap-1 text-sm ${
                          tx.type === "CAPITAL"
                            ? "text-purple-600"
                            : tx.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {tx.type === "CAPITAL" ? (
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        ) : tx.type === "INCOME" ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        )}
                        <span>{formatCurrency(tx.amount.toString())}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Wallet className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No transactions recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Use the quick recorder to add initial capital or expenses.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Recording Sidebar Panel */}
        <div className="lg:col-span-1">
          <QuickTransactionForm categories={categories} />
        </div>
      </div>
    </div>
  );
}