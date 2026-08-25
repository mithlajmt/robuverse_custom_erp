import Link from "next/link";
import { getCategories, getTransactions } from "@/lib/repositories/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { softDeleteTransaction } from "@/lib/actions/transactions";
import { QuickTransactionForm } from "@/components/quick-transaction-form";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Search,
  Filter,
  Trash2,
  Calendar,
  XCircle,
  Clock
} from "lucide-react";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  
  // Load data based on filters
  const categories = await getCategories();
  const transactions = await getTransactions({
    query: params.query,
    categoryId: params.categoryId,
    from: params.from,
    to: params.to
  });

  // Inline server action to handle soft delete
  const handleDelete = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await softDeleteTransaction(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Central Ledger</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent mt-1">
          Ledger Transactions
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Every financial inflow and outflow originates here. Use filters to query transaction history.
        </p>
      </div>

      {/* Filters Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Search Description
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                name="query"
                defaultValue={params.query || ""}
                placeholder="Search descriptions, notes..."
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none transition"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              name="categoryId"
              defaultValue={params.categoryId || ""}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date range from */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              From Date
            </label>
            <input
              type="date"
              name="from"
              defaultValue={params.from || ""}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>

          {/* Date range to */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              To Date
            </label>
            <input
              type="date"
              name="to"
              defaultValue={params.to || ""}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 text-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="lg:col-span-5 flex flex-wrap gap-2 justify-end mt-2 pt-4 border-t border-slate-800">
            {(params.query || params.categoryId || params.from || params.to) && (
              <Link
                href="/transactions"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-850 rounded-lg transition"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </Link>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg transition shadow-md shadow-cyan-500/10"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Ledger Table */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Ledger Records</h2>

          <div className="flex-1">
            {transactions.length > 0 ? (
              <>
                {/* Desktop View Table */}
                <table className="hidden md:table w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 px-4">Details</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 px-4">Method</th>
                      <th className="pb-3 px-4 text-right">Amount</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/10 transition">
                        <td className="py-3.5 pr-4 text-xs font-medium text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>{formatDate(tx.transactionDate)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="font-semibold text-slate-200 truncate">{tx.description}</div>
                          {tx.referenceNumber && (
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Ref: {tx.referenceNumber}</div>
                          )}
                          {tx.notes && (
                            <div className="text-xs text-slate-400 mt-1 bg-slate-950/40 p-1.5 rounded border border-slate-800/40 italic">
                              &ldquo;{tx.notes}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-850 text-slate-300 border border-slate-800">
                            {tx.category?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium text-xs whitespace-nowrap">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div
                            className={`font-semibold flex items-center justify-end gap-1 ${
                              tx.type === "CAPITAL"
                                ? "text-purple-400"
                                : tx.type === "INCOME"
                                ? "text-green-400"
                                : "text-red-400"
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
                        <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={tx.id} />
                            <button
                              type="submit"
                              title="Soft delete transaction"
                              className="p-1.5 rounded-lg border border-slate-800 hover:border-red-900 bg-slate-950 text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile View Card List */}
                <div className="md:hidden space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-455 text-slate-400">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{formatDate(tx.transactionDate)}</span>
                        </div>
                        <p className="font-semibold text-slate-200 text-sm mt-1 truncate">{tx.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tx.paymentMethod} {tx.referenceNumber ? `• Ref: ${tx.referenceNumber}` : ""}
                        </p>
                        {tx.notes && (
                          <p className="text-xs text-slate-400 mt-1 bg-slate-950/20 p-1.5 rounded border border-slate-850 italic">
                            &ldquo;{tx.notes}&rdquo;
                          </p>
                        )}
                        <span className="inline-block text-[10px] px-2 py-0.5 mt-2 rounded-full font-medium bg-slate-850 text-slate-400 border border-slate-800">
                          {tx.category?.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <div
                          className={`font-semibold flex items-center gap-1 text-sm ${
                            tx.type === "CAPITAL"
                              ? "text-purple-400"
                              : tx.type === "INCOME"
                              ? "text-green-450 text-green-400"
                              : "text-red-400"
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
                        
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={tx.id} />
                          <button
                            type="submit"
                            title="Soft delete transaction"
                            className="p-2 rounded-lg border border-slate-800 hover:border-red-900 bg-slate-950 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Clock className="h-8 w-8 text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-400">No records found matching filters.</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the date range or search keyword.</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Sidebar Form */}
        <div className="xl:col-span-1">
          <QuickTransactionForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
