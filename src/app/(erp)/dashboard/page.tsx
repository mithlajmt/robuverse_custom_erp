import { Activity, Plus } from "lucide-react";
import Link from "next/link";
import { FinanceCharts } from "@/components/finance-charts";
import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionTable } from "@/components/transaction-table";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getDashboardSummary } from "@/lib/repositories/transactions";

export default async function DashboardPage() {
  const [summary, categories] = await Promise.all([getDashboardSummary(), getCategories()]);

  return (
    <>
      <PageHeading
        eyebrow="Control center"
        title="Company financial health"
        description="A centralized operational view powered by the transaction ledger. Soft-deleted records are excluded from every metric."
        action={
          <Link
            href="#quick-entry"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Balance" value={summary.currentBalance} helper="All inflows - all outflows" />
        <StatCard label="Monthly Inflow" value={summary.monthlyIncome} tone="green" />
        <StatCard label="Monthly Outflow" value={summary.monthlyExpense} tone="rose" />
        <StatCard label="Pending Debts" value={summary.pendingDebts} tone="amber" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Inflow" value={summary.totalIncome} tone="green" />
        <StatCard label="Total Outflow" value={summary.totalExpense} tone="rose" />
        <StatCard label="Net Profit" value={summary.netProfit} />
        <StatCard label="Salary Paid" value={summary.salaryPaid} tone="amber" />
      </div>
      <div className="mt-6">
        <FinanceCharts monthlyTrend={summary.monthlyTrend} categorySpend={summary.categorySpend} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-50">
            <Activity className="h-4 w-4 text-cyan-300" />
            Recent Transactions
          </div>
          <TransactionTable transactions={summary.recentTransactions} />
        </section>
        <section id="quick-entry">
          {categories.length ? (
            <TransactionForm categories={categories} />
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-slate-300">Configure `DATABASE_URL`, run Prisma migrations, then seed categories to enable quick entry.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
